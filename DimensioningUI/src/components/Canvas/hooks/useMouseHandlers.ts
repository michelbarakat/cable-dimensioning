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
    crossSection: string;
    isCopper: boolean;
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

      if (popover?.visible) {
        setPopover(null);
      }

      if (activeTool === "erase") {
        const nearestPoint = getNearestPoint(stagePoint, 10);
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

      if (activeTool === "line") {
        const nearestPoint = getNearestPoint(stagePoint, 10);
        const nearestSegment = getNearestSegment(stagePoint, 10);
        
        // If a segment is selected, only allow modifying it (no drawing)
        if (selectedSegmentIndex !== null) {
          // Check for double-click on selected segment
          if (nearestSegment === selectedSegmentIndex) {
            const now = Date.now();
            const lastClick = lastClickRef.current;

            if (
              lastClick.point &&
              lastClick.point.segment === selectedSegmentIndex &&
              now - lastClick.time < 300
            ) {
              if (dragTimeoutRef.current) {
                clearTimeout(dragTimeoutRef.current);
                dragTimeoutRef.current = null;
              }
              lastClickRef.current = { time: 0, point: null };

              const segment = segments[selectedSegmentIndex];
              const midPoint = segment.points.length > 0 
                ? segment.points[Math.floor(segment.points.length / 2)]
                : segment.points[0];
              
              onSegmentDoubleClick(
                selectedSegmentIndex,
                midPoint.x + stagePosition.x,
                midPoint.y + stagePosition.y
              );
              return;
            }

            lastClickRef.current = { time: now, point: { segment: selectedSegmentIndex, point: 0 } };
          }

          // If clicking on a point of the selected segment
          if (nearestPoint !== null && nearestPoint.segment === selectedSegmentIndex) {
            const segment = segments[selectedSegmentIndex];
            const isEndpoint = nearestPoint.point === 0 || nearestPoint.point === segment.points.length - 1;
            
            if (isEndpoint) {
              // Clicking on endpoint → drag that point to resize
              setIsDraggingPoint(true);
              setHoveredPointIndex(nearestPoint);
            } else {
              // Clicking on middle point → drag that point
              setIsDraggingPoint(true);
              setHoveredPointIndex(nearestPoint);
            }
            setDragStart(stagePoint);
            return;
          }

          // If clicking on the body of the selected segment → drag the whole segment
          if (nearestSegment === selectedSegmentIndex && nearestPoint === null) {
            setIsDraggingSegment(true);
            setDragStart(stagePoint);
            return;
          }

          // If clicking outside the selected segment, deselect it
          if (nearestSegment !== selectedSegmentIndex) {
            setSelectedSegmentIndex(null);
            // Continue to handle the click (select new segment or start drawing)
          } else {
            // Clicking on selected segment but not starting drag - just return
            return;
          }
        }

        // No segment selected - allow normal interactions
        // First check if clicking near a segment endpoint to start drawing from there
        const nearestEndpoint = getNearestSegmentEndpoint(stagePoint, 15);
        if (nearestEndpoint !== null) {
          const snappedPoint = snapPoint(nearestEndpoint.point);
          setIsDrawing(true);
          setCurrentSegment([snappedPoint]);
          return;
        }

        // Check for segment double-click
        if (nearestSegment !== null) {
          const now = Date.now();
          const lastClick = lastClickRef.current;

          if (
            lastClick.point &&
            lastClick.point.segment === nearestSegment &&
            now - lastClick.time < 300
          ) {
            if (dragTimeoutRef.current) {
              clearTimeout(dragTimeoutRef.current);
              dragTimeoutRef.current = null;
            }
            lastClickRef.current = { time: 0, point: null };

            const segment = segments[nearestSegment];
            const midPoint = segment.points.length > 0 
              ? segment.points[Math.floor(segment.points.length / 2)]
              : segment.points[0];
            
            onSegmentDoubleClick(
              nearestSegment,
              midPoint.x + stagePosition.x,
              midPoint.y + stagePosition.y
            );
            return;
          }

          lastClickRef.current = { time: now, point: { segment: nearestSegment, point: 0 } };
        }

        // Single click on segment → select it
        if (nearestSegment !== null) {
          setSelectedSegmentIndex(nearestSegment);
          setDragStart(stagePoint);
          return;
        }

        // Otherwise, start drawing from clicked location
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
      snapPoint,
    ]
  );

  return {
    handleMouseDown,
    dragTimeoutRef,
  };
}

