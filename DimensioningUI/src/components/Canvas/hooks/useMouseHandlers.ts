import { useCallback, useRef } from "react";
import type { CableSegment, Point, Tool, HoveredPoint } from "../types";
import { calculateSegmentLength, snapToGridPoint, isConnectionPoint } from "../utils";

const DEFAULT_CROSS_SECTION = 2.5;

type UseMouseHandlersProps = {
  cableEngine: unknown;
  segments: CableSegment[];
  activeTool: Tool;
  isSpacePressed: boolean;
  stagePosition: { x: number; y: number };
  scale: number;
  snapToGrid: boolean;
  crossSectionValues: Map<string, number>;
  popover: {
    visible: boolean;
    x: number;
    y: number;
    connectionKey: string;
    value: number;
  } | null;
  getNearestPoint: (point: Point, threshold?: number) => HoveredPoint | null;
  getNearestSegment: (point: Point, threshold?: number) => number | null;
  splitSegmentAtPoint: (segmentIndex: number, point: Point) => void;
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
    connectionKey: string;
    value: number;
  } | null) => void;
};

export function useMouseHandlers({
  cableEngine,
  segments,
  activeTool,
  isSpacePressed,
  stagePosition,
  scale,
  snapToGrid,
  crossSectionValues,
  popover,
  getNearestPoint,
  getNearestSegment,
  splitSegmentAtPoint,
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
        const segment = segments[nearestPoint.segment];
        const pointIndex = nearestPoint.point;

        let isCrossSectionPoint = false;
        let connectionKey: string | null = null;
        if (segment.connectedTo !== undefined) {
          const connectedIndex = segment.connectedTo;
          const connectedSegment = segments[connectedIndex];
          isCrossSectionPoint = isConnectionPoint(
            segment,
            pointIndex,
            connectedSegment
          );
          if (isCrossSectionPoint) {
            connectionKey = `${Math.min(nearestPoint.segment, connectedIndex)}-${Math.max(nearestPoint.segment, connectedIndex)}`;
          }
        }

        if (isCrossSectionPoint && connectionKey && activeTool !== "erase") {
          const now = Date.now();
          const lastClick = lastClickRef.current;

          if (
            lastClick.point &&
            lastClick.point.segment === nearestPoint.segment &&
            lastClick.point.point === nearestPoint.point &&
            now - lastClick.time < 300
          ) {
            if (dragTimeoutRef.current) {
              clearTimeout(dragTimeoutRef.current);
              dragTimeoutRef.current = null;
            }
            lastClickRef.current = { time: 0, point: null };

            const crossSectionValue =
              crossSectionValues.get(connectionKey) ?? DEFAULT_CROSS_SECTION;
            const canvasPoint = segment.points[pointIndex];

            setPopover({
              visible: true,
              x: canvasPoint.x + stagePosition.x,
              y: canvasPoint.y + stagePosition.y - 30,
              connectionKey,
              value: crossSectionValue,
            });
            return;
          }

          lastClickRef.current = { time: now, point: nearestPoint };

          if (dragTimeoutRef.current) {
            clearTimeout(dragTimeoutRef.current);
          }

          if (activeTool === "line") {
            dragTimeoutRef.current = setTimeout(() => {
              setIsDraggingPoint(true);
              setSelectedSegmentIndex(nearestPoint.segment);
              setHoveredPointIndex(nearestPoint);
              setDragStart(stagePoint);
              dragTimeoutRef.current = null;
            }, 300);
          }

          return;
        }

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

        const nearestSegment = getNearestSegment(stagePoint, 10);
        if (nearestSegment !== null) {
          deleteSegment(nearestSegment);
          return;
        }
        return;
      }

      if (activeTool === "crossSection") {
        const nearestSegment = getNearestSegment(stagePoint, 10);
        if (nearestSegment !== null) {
          splitSegmentAtPoint(nearestSegment, stagePoint);
          return;
        }
      }

      const nearestSegment = getNearestSegment(stagePoint, 10);
      if (nearestSegment !== null && activeTool === "line") {
        setIsDraggingSegment(true);
        setSelectedSegmentIndex(nearestSegment);
        setDragStart(stagePoint);
        return;
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
      crossSectionValues,
      popover,
      getNearestPoint,
      getNearestSegment,
      splitSegmentAtPoint,
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
      snapPoint,
    ]
  );

  return {
    handleMouseDown,
    dragTimeoutRef,
  };
}

