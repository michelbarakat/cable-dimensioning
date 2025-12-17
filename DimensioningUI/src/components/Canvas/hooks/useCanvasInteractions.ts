import { useCallback } from "react";
import { parseNumber } from "../../../lib/numberInput";
import type { CableSegment, Point, Tool, HoveredPoint } from "../types";
import { snapToGridPoint, isConnectionPoint } from "../utils";
import { calculateSegmentLength } from "../utils";

export function useCanvasInteractions(
  segments: CableSegment[],
  scale: string,
  snapToGrid: boolean,
  crossSection: string,
  crossSectionValues: Map<string, number>,
  activeTool: Tool,
  isSpacePressed: boolean,
  stagePosition: { x: number; y: number },
  selectedSegmentIndex: number | null,
  hoveredPointIndex: HoveredPoint | null,
  dragStart: Point,
  isPanning: boolean,
  isDraggingPoint: boolean,
  isDraggingSegment: boolean,
  isDrawing: boolean,
  currentSegment: Point[],
  setIsPanning: (value: boolean) => void,
  setPanStart: (value: Point) => void,
  setIsDraggingPoint: (value: boolean) => void,
  setIsDraggingSegment: (value: boolean) => void,
  setSelectedSegmentIndex: (value: number | null) => void,
  setHoveredPointIndex: (value: HoveredPoint | null) => void,
  setDragStart: (value: Point) => void,
  setSegments: (segments: CableSegment[]) => void,
  setCurrentSegment: (points: Point[]) => void,
  setIsDrawing: (value: boolean) => void,
  setPopover: (popover: {
    visible: boolean;
    x: number;
    y: number;
    connectionKey: string;
    value: number;
  } | null) => void,
  popover: {
    visible: boolean;
    x: number;
    y: number;
    connectionKey: string;
    value: number;
  } | null,
  saveToHistory: (segments: CableSegment[]) => void,
  getNearestPoint: (point: Point, threshold?: number) => HoveredPoint | null,
  getNearestSegment: (point: Point, threshold?: number) => number | null,
  splitSegmentAtPoint: (segmentIndex: number, point: Point) => void,
  deleteSegment: (segmentIndex: number) => void,
  mergeSegments: (segmentIndex: number) => void
) {
  const scaleValue = parseNumber(scale);

  const handlePanMove = useCallback(
    (point: Point) => {
      const newX = point.x - dragStart.x;
      const newY = point.y - dragStart.y;
      return { x: newX, y: newY };
    },
    [dragStart]
  );

  const handlePointDrag = useCallback(
    (stagePoint: Point): CableSegment[] => {
      if (selectedSegmentIndex === null || hoveredPointIndex === null)
        return segments;
      const snappedPoint = snapToGridPoint(stagePoint, scaleValue, snapToGrid);
      const newSegments = [...segments];
      const seg = newSegments[selectedSegmentIndex];
      const pointIndex = hoveredPointIndex.point;
      const originalPoint = seg.points[pointIndex];

      // Update the point in the current segment
      const newPoints = [...seg.points];
      newPoints[pointIndex] = snappedPoint;
      const newLength = calculateSegmentLength(newPoints, scaleValue);
      newSegments[selectedSegmentIndex] = {
        points: newPoints,
        length: newLength,
        crossSection: seg.crossSection,
        connectedTo: seg.connectedTo,
      };

      // If this is a cross-section point (shared between connected segments), update the connected segment too
      if (seg.connectedTo !== undefined) {
        const connectedIndex = seg.connectedTo;
        const connectedSeg = newSegments[connectedIndex];

        // Find the corresponding point in the connected segment by matching coordinates
        let connectedPointIndex: number | null = null;
        for (let i = 0; i < connectedSeg.points.length; i++) {
          const p = connectedSeg.points[i];
          // Check if this point matches the original point position (before dragging)
          if (
            Math.abs(originalPoint.x - p.x) < 1 &&
            Math.abs(originalPoint.y - p.y) < 1
          ) {
            connectedPointIndex = i;
            break;
          }
        }

        if (connectedPointIndex !== null) {
          const connectedNewPoints = [...connectedSeg.points];
          connectedNewPoints[connectedPointIndex] = snappedPoint;
          const connectedNewLength = calculateSegmentLength(
            connectedNewPoints,
            scaleValue
          );
          newSegments[connectedIndex] = {
            ...connectedSeg,
            points: connectedNewPoints,
            length: connectedNewLength,
          };
        }
      }

      return newSegments;
    },
    [
      segments,
      selectedSegmentIndex,
      hoveredPointIndex,
      scaleValue,
      snapToGrid,
    ]
  );

  const handleSegmentDrag = useCallback(
    (stagePoint: Point): { segments: CableSegment[]; newDragStart: Point } => {
      if (selectedSegmentIndex === null)
        return { segments, newDragStart: dragStart };
      const dx = stagePoint.x - dragStart.x;
      const dy = stagePoint.y - dragStart.y;
      const newSegments = [...segments];
      const seg = newSegments[selectedSegmentIndex];
      const newPoints = seg.points.map((p) => ({
        x: p.x + dx,
        y: p.y + dy,
      }));
      const newLength = calculateSegmentLength(newPoints, scaleValue);
      newSegments[selectedSegmentIndex] = {
        points: newPoints,
        length: newLength,
        crossSection: seg.crossSection,
        connectedTo: seg.connectedTo,
      };
      return { segments: newSegments, newDragStart: stagePoint };
    },
    [segments, selectedSegmentIndex, dragStart, scaleValue]
  );

  return {
    handlePanMove,
    handlePointDrag,
    handleSegmentDrag,
  };
}

