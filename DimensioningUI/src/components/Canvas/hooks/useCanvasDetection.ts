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

  return { getNearestPoint, getNearestSegment };
}

