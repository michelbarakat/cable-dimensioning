import { useCallback } from "react";
import type { CableSegment, Point, HoveredPoint } from "../types";
import { calculateDistance, getPointOnLineDistance } from "../utils";

export function useCanvasDetection(segments: CableSegment[]) {
  const getNearestPoint = useCallback(
    (point: Point, threshold: number = 10): HoveredPoint | null => {
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        for (let j = 0; j < seg.points.length; j++) {
          const p = seg.points[j];
          const dist = calculateDistance(point, p);
          if (dist < threshold) {
            return { segment: i, point: j };
          }
        }
      }
      return null;
    },
    [segments]
  );

  const getNearestSegment = useCallback(
    (point: Point, threshold: number = 10): number | null => {
      let minDist = Infinity;
      let nearestIndex: number | null = null;

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (seg.points.length < 2) continue;

        // Check distance to each line segment between consecutive points
        for (let j = 0; j < seg.points.length - 1; j++) {
          const dist = getPointOnLineDistance(
            point,
            seg.points[j],
            seg.points[j + 1]
          );
          if (dist < threshold && dist < minDist) {
            minDist = dist;
            nearestIndex = i;
          }
        }
      }

      return nearestIndex;
    },
    [segments]
  );

  const getNearestSegmentEndpoint = useCallback(
    (point: Point, threshold: number = 15): { segmentIndex: number; point: Point; isStart: boolean } | null => {
      let minDist = Infinity;
      let nearest: { segmentIndex: number; point: Point; isStart: boolean } | null = null;

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (seg.points.length < 2) continue;

        const startPoint = seg.points[0];
        const endPoint = seg.points[seg.points.length - 1];

        const startDist = calculateDistance(point, startPoint);
        const endDist = calculateDistance(point, endPoint);

        if (startDist < threshold && startDist < minDist) {
          minDist = startDist;
          nearest = { segmentIndex: i, point: startPoint, isStart: true };
        }
        if (endDist < threshold && endDist < minDist) {
          minDist = endDist;
          nearest = { segmentIndex: i, point: endPoint, isStart: false };
        }
      }

      return nearest;
    },
    [segments]
  );

  return { getNearestPoint, getNearestSegment, getNearestSegmentEndpoint };
}

