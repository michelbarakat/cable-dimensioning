import { useCallback, useRef } from "react";
import type { CableSegment, Point, Tool, HoveredPoint, TemperaturePreset } from "../types";
import { snapToGridPoint, isConnectionPoint } from "../utils";

type UseMouseHandlersProps = {
  cableEngine: unknown;
  segments: CableSegment[];
  activeTool: Tool;
  isSpacePressed: boolean;
  stagePosition: { x: number; y: number };
  scale: number;
  snapToGrid: boolean;
  popover: {
    visible: boolean;
    x: number;
    y: number;
    segmentIndex: number;
    crossSection: string;
    isCopper: boolean;
    temperature: TemperaturePreset;
  } | null;
  getNearestPoint: (point: Point, threshold?: number) => HoveredPoint | null;
  getNearestSegment: (point: Point, threshold?: number) => number | null;
  getNearestSegmentEndpoint: (point: Point, threshold?: number) => { segmentIndex: number; point: Point; isStart: boolean } | null;
  selectedSegmentIndex: number | null;
  deleteSegment: (segmentIndex: number) => void;
  mergeSegments: (segmentIndex: number) => void;
  setIsPanning: (value: boolean) => void;
  setPanStart: (value: Point) => void;
  setIsDraggingPoint: (value: boolean) => void;
  setIsDraggingSegment: (value: boolean) => void;
  setSelectedSegmentIndex: (value: number | null) => void;
  setHoveredPointIndex: (value: HoveredPoint | null) => void;
  setDragStart: (value: Point) => void;
  setIsDrawing: (value: boolean) => void;
  setCurrentSegment: (points: Point[]) => void;
  setPopover: (popover: {
    visible: boolean;
    x: number;
    y: number;
    segmentIndex: number;
    crossSection: string;
    isCopper: boolean;
    temperature: TemperaturePreset;
  } | null) => void;
  onSegmentDoubleClick: (segmentIndex: number, x: number, y: number) => void;
};

export function useMouseHandlers({
  segments,
  activeTool,
  isSpacePressed,
  stagePosition,
  scale,
  snapToGrid,
  popover,
  getNearestPoint,
  getNearestSegment,
  getNearestSegmentEndpoint,
  selectedSegmentIndex,
  deleteSegment,
  mergeSegments,
  setIsPanning,
  setPanStart,
  setIsDraggingPoint,
  setIsDraggingSegment,
  setSelectedSegmentIndex,
  setHoveredPointIndex,
  setDragStart,
  setIsDrawing,
  setCurrentSegment,
  setPopover,
  onSegmentDoubleClick,
}: UseMouseHandlersProps) {
  const lastClickRef = useRef<{ time: number; point: HoveredPoint | null }>({
    time: 0,
    point: null,
  });
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const snapPoint = useCallback(
    (point: Point): Point => {
      return snapToGridPoint(point, scale, snapToGrid);
    },
    [scale, snapToGrid]
  );

  const handleDoubleClick = useCallback(
    (segmentIndex: number) => {
      const segment = segments[segmentIndex];
      const pointCount = segment.points.length;
      const midIndex = Math.floor(pointCount / 2);
      const midPoint = segment.points[midIndex] || segment.points[0];
      
      onSegmentDoubleClick(
        segmentIndex,
        midPoint.x + stagePosition.x,
        midPoint.y + stagePosition.y
      );
    },
    [segments, stagePosition, onSegmentDoubleClick]
  );

  const clearDragTimeout = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
  }, []);

  const checkAndHandleDoubleClick = useCallback(
    (segmentIndex: number | null): boolean => {
      if (segmentIndex === null) return false;

      const now = Date.now();
      const lastClick = lastClickRef.current;
      const lastPoint = lastClick.point;
      const isDoubleClick = lastPoint !== null && lastPoint.segment === segmentIndex && now - lastClick.time < 300;

      if (isDoubleClick) {
        clearDragTimeout();
        lastClickRef.current = { time: 0, point: null };
        handleDoubleClick(segmentIndex);
        return true;
      }

      lastClickRef.current = { time: now, point: { segment: segmentIndex, point: 0 } };
      return false;
    },
    [handleDoubleClick, clearDragTimeout]
  );

  const handleConnectionPointMerge = useCallback(
    (nearestPoint: HoveredPoint): boolean => {
      const segment = segments[nearestPoint.segment];
      const connectedIndex = segment.connectedTo;
      if (connectedIndex === undefined) return false;
      
      const connectedSegment = segments[connectedIndex];
      const isConnPoint = isConnectionPoint(segment, nearestPoint.point, connectedSegment);
      if (isConnPoint) {
        mergeSegments(nearestPoint.segment);
      }
      return isConnPoint;
    },
    [segments, mergeSegments]
  );

  const handleEraseTool = useCallback(
    (stagePoint: Point): boolean => {
      const nearestPoint = getNearestPoint(stagePoint, 10);
      if (nearestPoint && handleConnectionPointMerge(nearestPoint)) {
        return true;
      }

      const nearestSegmentForErase = getNearestSegment(stagePoint, 10);
      if (nearestSegmentForErase !== null) {
        deleteSegment(nearestSegmentForErase);
        return true;
      }

      return false;
    },
    [getNearestPoint, getNearestSegment, handleConnectionPointMerge, deleteSegment]
  );

  const handlePointDrag = useCallback(
    (nearestPoint: HoveredPoint, stagePoint: Point) => {
      setIsDraggingPoint(true);
      setHoveredPointIndex(nearestPoint);
      setDragStart(stagePoint);
    },
    [setIsDraggingPoint, setHoveredPointIndex, setDragStart]
  );

  const handleSegmentBodyDrag = useCallback(
    (stagePoint: Point) => {
      setIsDraggingSegment(true);
      setDragStart(stagePoint);
    },
    [setIsDraggingSegment, setDragStart]
  );

  const handleSelectedSegmentInteraction = useCallback(
    (stagePoint: Point, nearestPoint: HoveredPoint | null, nearestSegment: number | null): boolean => {
      if (selectedSegmentIndex === null) return false;

      const isOnSelectedSegment = nearestSegment === selectedSegmentIndex;
      const isOnSelectedPoint = nearestPoint !== null && nearestPoint.segment === selectedSegmentIndex;

      if (isOnSelectedSegment) {
        if (checkAndHandleDoubleClick(selectedSegmentIndex)) return true;
        if (nearestPoint === null) {
          handleSegmentBodyDrag(stagePoint);
          return true;
        }
      }

      if (isOnSelectedPoint) {
        handlePointDrag(nearestPoint, stagePoint);
        return true;
      }

      if (!isOnSelectedSegment) {
        setSelectedSegmentIndex(null);
        return false;
      }

      return true;
    },
    [selectedSegmentIndex, checkAndHandleDoubleClick, handlePointDrag, handleSegmentBodyDrag, setSelectedSegmentIndex]
  );

  const startDrawing = useCallback(
    (point: Point) => {
      const snappedPoint = snapPoint(point);
      setIsDrawing(true);
      setCurrentSegment([snappedPoint]);
    },
    [snapPoint, setIsDrawing, setCurrentSegment]
  );

  const handleUnselectedSegmentInteraction = useCallback(
    (stagePoint: Point, nearestSegment: number | null): boolean => {
      const nearestEndpoint = getNearestSegmentEndpoint(stagePoint, 15);
      if (nearestEndpoint !== null) {
        startDrawing(nearestEndpoint.point);
        return true;
      }

      if (nearestSegment === null) return false;

      if (checkAndHandleDoubleClick(nearestSegment)) {
        return true;
      }

      setSelectedSegmentIndex(nearestSegment);
      setDragStart(stagePoint);
      return true;
    },
    [getNearestSegmentEndpoint, startDrawing, checkAndHandleDoubleClick, setSelectedSegmentIndex, setDragStart]
  );

  const handlePanning = useCallback(
    (point: { x: number; y: number }) => {
      setIsPanning(true);
      setPanStart({
        x: point.x - stagePosition.x,
        y: point.y - stagePosition.y,
      });
      if (popover?.visible) setPopover(null);
    },
    [stagePosition, popover, setIsPanning, setPanStart, setPopover]
  );

  const handleLineTool = useCallback(
    (stagePoint: Point) => {
      // Deselect any selected segment when using line tool
      if (selectedSegmentIndex !== null) {
        setSelectedSegmentIndex(null);
      }

      const nearestPoint = getNearestPoint(stagePoint, 10);
      const nearestSegment = getNearestSegment(stagePoint, 10);
      
      // Check for double-click to open popover (but don't allow moving/resizing)
      if (nearestSegment !== null && checkAndHandleDoubleClick(nearestSegment)) {
        return;
      }

      // Check if clicking near an endpoint to start drawing from there
      const nearestEndpoint = getNearestSegmentEndpoint(stagePoint, 15);
      if (nearestEndpoint !== null) {
        startDrawing(nearestEndpoint.point);
        return;
      }

      // Otherwise, start drawing from the clicked location
      startDrawing(stagePoint);
    },
    [selectedSegmentIndex, setSelectedSegmentIndex, getNearestPoint, getNearestSegment, getNearestSegmentEndpoint, checkAndHandleDoubleClick, startDrawing]
  );

  const handleSelectTool = useCallback(
    (stagePoint: Point) => {
      const nearestPoint = getNearestPoint(stagePoint, 10);
      const nearestSegment = getNearestSegment(stagePoint, 10);
      
      // Handle interactions with selected segment (move/resize)
      if (handleSelectedSegmentInteraction(stagePoint, nearestPoint, nearestSegment)) {
        return;
      }

      // Handle interactions with unselected segments (select only, no drawing)
      if (nearestSegment === null) {
        // Clicking on empty space - deselect if something is selected
        if (selectedSegmentIndex !== null) {
          setSelectedSegmentIndex(null);
        }
        return;
      }

      // Check for double-click to open popover
      if (checkAndHandleDoubleClick(nearestSegment)) {
        return;
      }

      // Single click on segment - select it
      setSelectedSegmentIndex(nearestSegment);
      setDragStart(stagePoint);
    },
    [getNearestPoint, getNearestSegment, handleSelectedSegmentInteraction, checkAndHandleDoubleClick, selectedSegmentIndex, setSelectedSegmentIndex, setDragStart]
  );

  const executeToolAction = useCallback(
    (stagePoint: Point) => {
      if (popover?.visible) setPopover(null);
      const toolHandlers: Record<Tool, (stagePoint: Point) => void> = {
        erase: handleEraseTool,
        line: handleLineTool,
        select: handleSelectTool,
      };
      const handler = toolHandlers[activeTool];
      if (handler) handler(stagePoint);
    },
    [popover, setPopover, activeTool, handleEraseTool, handleLineTool, handleSelectTool]
  );

  const handleMouseDown = useCallback(
    (e: any) => {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const stagePoint = {
        x: point.x - stagePosition.x,
        y: point.y - stagePosition.y,
      };

      if (isSpacePressed) {
        handlePanning(point);
      } else {
        executeToolAction(stagePoint);
      }
    },
    [isSpacePressed, stagePosition, handlePanning, executeToolAction]
  );

  return {
    handleMouseDown,
    dragTimeoutRef,
  };
}

