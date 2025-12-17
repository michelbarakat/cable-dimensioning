import { useCallback } from "react";
import { parseNumber } from "../../../lib/numberInput";
import type { CableSegment, Point } from "../types";
import {
  calculateSegmentLength,
  snapToGridPoint,
  pointExistsAtLocation,
  findConnectionPoint,
} from "../utils";

export function useSegmentOperations(
  segments: CableSegment[],
  scale: string,
  snapToGrid: boolean,
  crossSection: string,
  crossSectionValues: Map<string, number>,
  setSegments: (segments: CableSegment[]) => void,
  setCrossSectionValues: (values: Map<string, number>) => void,
  saveToHistory: (segments: CableSegment[]) => void
) {
  const scaleValue = parseNumber(scale);

  const splitSegmentAtPoint = useCallback(
    (segmentIndex: number, point: Point): void => {
      const segment = segments[segmentIndex];
      if (segment.points.length < 2) return;

      const startPoint = segment.points[0];
      const endPoint = segment.points[segment.points.length - 1];
      const snappedPoint = snapToGridPoint(point, scaleValue, snapToGrid);

      // Check if a point already exists at this location (prevent duplicates)
      if (pointExistsAtLocation(snappedPoint, segments, 5)) {
        return; // Don't create duplicate cross-section
      }

      // Create connection key for the cross-section
      const connectionKey = `${segmentIndex}-${segmentIndex + 1}`;

      // Create two new segments
      const firstSegment: CableSegment = {
        points: [startPoint, snappedPoint],
        length: calculateSegmentLength([startPoint, snappedPoint], scaleValue),
        crossSection: segment.crossSection,
        connectedTo: segmentIndex + 1, // Connected to the second segment
      };

      const secondSegment: CableSegment = {
        points: [snappedPoint, endPoint],
        length: calculateSegmentLength([snappedPoint, endPoint], scaleValue),
        crossSection: segment.crossSection,
        connectedTo: segmentIndex, // Connected to the first segment
      };

      // Initialize cross-section value with default if not set
      const newCrossSectionValues = new Map(crossSectionValues);
      if (!newCrossSectionValues.has(connectionKey)) {
        newCrossSectionValues.set(connectionKey, parseNumber(crossSection));
        setCrossSectionValues(newCrossSectionValues);
      }

      // Replace the original segment with the two new segments
      const newSegments = [...segments];
      newSegments.splice(segmentIndex, 1, firstSegment, secondSegment);
      setSegments(newSegments);
      saveToHistory(newSegments);
    },
    [
      segments,
      scaleValue,
      snapToGrid,
      crossSection,
      crossSectionValues,
      setSegments,
      setCrossSectionValues,
      saveToHistory,
    ]
  );

  const mergeSegments = useCallback(
    (segmentIndex: number): void => {
      const segment = segments[segmentIndex];
      if (segment.connectedTo === undefined) return;

      const connectedIndex = segment.connectedTo;
      if (connectedIndex < 0 || connectedIndex >= segments.length) return;

      const connectedSegment = segments[connectedIndex];
      if (connectedSegment.connectedTo !== segmentIndex) return; // Not properly connected

      // Find the connection point (where they meet)
      const seg1Start = segment.points[0];
      const seg1End = segment.points[segment.points.length - 1];
      const seg2Start = connectedSegment.points[0];
      const seg2End = connectedSegment.points[connectedSegment.points.length - 1];

      // Determine which points to use - remove duplicate connection point
      let mergedPoints: Point[];
      if (
        Math.abs(seg1End.x - seg2Start.x) < 1 &&
        Math.abs(seg1End.y - seg2Start.y) < 1
      ) {
        // seg1 end connects to seg2 start
        mergedPoints = [...segment.points.slice(0, -1), ...connectedSegment.points];
      } else if (
        Math.abs(seg1Start.x - seg2End.x) < 1 &&
        Math.abs(seg1Start.y - seg2End.y) < 1
      ) {
        // seg1 start connects to seg2 end
        mergedPoints = [
          ...connectedSegment.points.slice(0, -1),
          ...segment.points,
        ];
      } else {
        // Default: connect end to start
        mergedPoints = [
          ...segment.points.slice(0, -1),
          ...connectedSegment.points,
        ];
      }

      const mergedSegment: CableSegment = {
        points: mergedPoints,
        length: calculateSegmentLength(mergedPoints, scaleValue),
        crossSection: segment.crossSection ?? connectedSegment.crossSection,
        // No connectedTo - it's now a single segment
      };

      // Remove cross-section value for this connection
      const connectionKey = `${Math.min(segmentIndex, connectedIndex)}-${Math.max(segmentIndex, connectedIndex)}`;
      const newCrossSectionValues = new Map(crossSectionValues);
      newCrossSectionValues.delete(connectionKey);
      setCrossSectionValues(newCrossSectionValues);

      // Replace both segments with the merged one
      const newSegments = [...segments];
      const indicesToRemove = [segmentIndex, connectedIndex].sort(
        (a, b) => b - a
      );
      indicesToRemove.forEach((idx) => newSegments.splice(idx, 1));
      newSegments.splice(
        Math.min(segmentIndex, connectedIndex),
        0,
        mergedSegment
      );
      setSegments(newSegments);
      saveToHistory(newSegments);
    },
    [
      segments,
      scaleValue,
      crossSectionValues,
      setSegments,
      setCrossSectionValues,
      saveToHistory,
    ]
  );

  const deleteSegment = useCallback(
    (segmentIndex: number): void => {
      const newSegments = segments.filter((_, index) => index !== segmentIndex);
      setSegments(newSegments);
      saveToHistory(newSegments);
    },
    [segments, setSegments, saveToHistory]
  );

  return {
    splitSegmentAtPoint,
    mergeSegments,
    deleteSegment,
  };
}

