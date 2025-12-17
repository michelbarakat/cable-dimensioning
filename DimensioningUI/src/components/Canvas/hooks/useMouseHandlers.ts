import { useCallback, useRef } from "react";
import type { CableSegment, Point, Tool, HoveredPoint } from "../types";
import { calculateSegmentLength, snapToGridPoint, isConnectionPoint } from "../utils";

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
    crossSection: number;
    isCopper: boolean;
  } | null;
  getNearestPoint: (point: Point, threshold?: number) => HoveredPoint | null;
  getNearestSegment: (point: Point, threshold?: number) => number | null;
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
    crossSection: number;
    isCopper: boolean;
  } | null) => void;
  onSegmentDoubleClick: (segmentIndex: number, x: number, y: number) => void;
};

export function useMouseHandlers({
  cableEngine,
  segments,
  activeTool,
  isSpacePressed,
  stagePosition,
  scale,
  snapToGrid,
  popover,
  getNearestPoint,
  getNearestSegment,
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

  const handleMouseDown = useCallback(
    (e: any) => {
      if (!cableEngine) return;
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();

      const stagePoint = {
        x: point.x - stagePosition.x,
        y: point.y - stagePosition.y,
      };

      if (isSpacePressed) {
        setIsPanning(true);
        setPanStart({
          x: point.x - stagePosition.x,
          y: point.y - stagePosition.y,
        });
        if (popover?.visible) {
          setPopover(null);
        }
        return;
      }

      const nearestPoint = getNearestPoint(stagePoint, 10);
      if (nearestPoint !== null) {
        if (activeTool === "line") {
          setIsDraggingPoint(true);
          setSelectedSegmentIndex(nearestPoint.segment);
          setHoveredPointIndex(nearestPoint);
          setDragStart(stagePoint);
          if (popover?.visible) {
            setPopover(null);
          }
          return;
        }
      }

      if (popover?.visible) {
        setPopover(null);
      }

      if (activeTool === "erase") {
        if (nearestPoint !== null) {
          const segment = segments[nearestPoint.segment];

          if (segment.connectedTo !== undefined) {
            const connectedIndex = segment.connectedTo;
            const connectedSegment = segments[connectedIndex];
            const pointIndex = nearestPoint.point;

            const isConnPoint = isConnectionPoint(
              segment,
              pointIndex,
              connectedSegment
            );

            if (isConnPoint) {
              mergeSegments(nearestPoint.segment);
              return;
            }
          }
        }

        const nearestSegmentForErase = getNearestSegment(stagePoint, 10);
        if (nearestSegmentForErase !== null) {
          deleteSegment(nearestSegmentForErase);
          return;
        }
        return;
      }

      // Check for segment double-click (only for line tool)
      if (activeTool === "line") {
        const nearestSegmentForDoubleClick = getNearestSegment(stagePoint, 20);
        if (nearestSegmentForDoubleClick !== null) {
          const now = Date.now();
          const lastClick = lastClickRef.current;

          if (
            lastClick.point &&
            lastClick.point.segment === nearestSegmentForDoubleClick &&
            now - lastClick.time < 300
          ) {
            if (dragTimeoutRef.current) {
              clearTimeout(dragTimeoutRef.current);
              dragTimeoutRef.current = null;
            }
            lastClickRef.current = { time: 0, point: null };

            const segment = segments[nearestSegmentForDoubleClick];
            const midPoint = segment.points.length > 0 
              ? segment.points[Math.floor(segment.points.length / 2)]
              : segment.points[0];
            
            onSegmentDoubleClick(
              nearestSegmentForDoubleClick,
              midPoint.x + stagePosition.x,
              midPoint.y + stagePosition.y
            );
            return;
          }

          lastClickRef.current = { time: now, point: { segment: nearestSegmentForDoubleClick, point: 0 } };
        }

        // Check for segment dragging (if not double-clicking)
        const nearestSegmentForDrag = getNearestSegment(stagePoint, 10);
        if (nearestSegmentForDrag !== null) {
          setIsDraggingSegment(true);
          setSelectedSegmentIndex(nearestSegmentForDrag);
          setDragStart(stagePoint);
          return;
        }
      }

      if (activeTool === "line") {
        const snappedPoint = snapPoint(stagePoint);
        setIsDrawing(true);
        setCurrentSegment([snappedPoint]);
      }
    },
    [
      cableEngine,
      segments,
      activeTool,
      isSpacePressed,
      stagePosition,
      popover,
      getNearestPoint,
      getNearestSegment,
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
      snapPoint,
    ]
  );

  return {
    handleMouseDown,
    dragTimeoutRef,
  };
}

