import type { Point, CableSegment } from "./types";

// Calculate distance between two points in pixels
export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Calculate total length of a segment in meters
export const calculateSegmentLength = (
  points: Point[],
  scale: number
): number => {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += calculateDistance(points[i - 1], points[i]);
  }
  return total / scale; // Convert pixels to meters
};

// Snap point to grid (0.1m increments)
export const snapToGridPoint = (
  point: Point,
  scale: number,
  snapToGrid: boolean
): Point => {
  if (!snapToGrid) return point;
  if (scale <= 0) return point;

  // Grid size: 0.1 meters = scale * 0.1 pixels
  const gridSize = scale * 0.1;

  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
};

// Check if a segment intersects with a rectangle
export const segmentIntersectsRect = (
  segment: { points: Point[] },
  rect: { start: Point; end: Point }
): boolean => {
  const minX = Math.min(rect.start.x, rect.end.x);
  const maxX = Math.max(rect.start.x, rect.end.x);
  const minY = Math.min(rect.start.y, rect.end.y);
  const maxY = Math.max(rect.start.y, rect.end.y);

  // Check if any point of the segment is inside the rectangle
  for (const point of segment.points) {
    if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
      return true;
    }
  }

  // Check if any edge of the segment intersects with the rectangle
  for (let i = 0; i < segment.points.length - 1; i++) {
    const p1 = segment.points[i];
    const p2 = segment.points[i + 1];
    
    // Check if line segment intersects rectangle
    if (lineIntersectsRect(p1, p2, { start: rect.start, end: rect.end })) {
      return true;
    }
  }

  return false;
};

// Check if a line segment intersects with a rectangle
const lineIntersectsRect = (
  lineStart: Point,
  lineEnd: Point,
  rect: { start: Point; end: Point }
): boolean => {
  const minX = Math.min(rect.start.x, rect.end.x);
  const maxX = Math.max(rect.start.x, rect.end.x);
  const minY = Math.min(rect.start.y, rect.end.y);
  const maxY = Math.max(rect.start.y, rect.end.y);

  // Check if line is completely outside rectangle
  if (
    (lineStart.x < minX && lineEnd.x < minX) ||
    (lineStart.x > maxX && lineEnd.x > maxX) ||
    (lineStart.y < minY && lineEnd.y < minY) ||
    (lineStart.y > maxY && lineEnd.y > maxY)
  ) {
    return false;
  }

  // Check if line endpoints are inside rectangle
  if (
    (lineStart.x >= minX && lineStart.x <= maxX && lineStart.y >= minY && lineStart.y <= maxY) ||
    (lineEnd.x >= minX && lineEnd.x <= maxX && lineEnd.y >= minY && lineEnd.y <= maxY)
  ) {
    return true;
  }

  // Check intersection with rectangle edges
  const edges = [
    { start: { x: minX, y: minY }, end: { x: maxX, y: minY } },
    { start: { x: maxX, y: minY }, end: { x: maxX, y: maxY } },
    { start: { x: maxX, y: maxY }, end: { x: minX, y: maxY } },
    { start: { x: minX, y: maxY }, end: { x: minX, y: minY } },
  ];

  for (const edge of edges) {
    if (linesIntersect(lineStart, lineEnd, edge.start, edge.end)) {
      return true;
    }
  }

  return false;
};

// Check if two line segments intersect
const linesIntersect = (
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): boolean => {
  const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denom === 0) return false; // Lines are parallel

  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
};

// Check if point is near a line segment
export const getPointOnLineDistance = (
  point: Point,
  lineStart: Point,
  lineEnd: Point
): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

// Check if a point already exists at a given location (within threshold)
export const pointExistsAtLocation = (
  point: Point,
  segments: Array<{ points: Point[] }>,
  threshold: number = 5
): boolean => {
  for (const segment of segments) {
    for (const existingPoint of segment.points) {
      const distance = calculateDistance(point, existingPoint);
      if (distance < threshold) {
        return true;
      }
    }
  }
  return false;
};

// Check if a point is a connection point between two segments
export const isConnectionPoint = (
  segment: { points: Point[]; connectedTo?: number },
  pointIndex: number,
  connectedSegment: { points: Point[] }
): boolean => {
  const seg1End = segment.points[segment.points.length - 1];
  const seg1Start = segment.points[0];
  const seg2Start = connectedSegment.points[0];
  const seg2End = connectedSegment.points[connectedSegment.points.length - 1];

  return (
    (pointIndex === segment.points.length - 1 &&
      Math.abs(seg1End.x - seg2Start.x) < 1 &&
      Math.abs(seg1End.y - seg2Start.y) < 1) ||
    (pointIndex === 0 &&
      Math.abs(seg1Start.x - seg2End.x) < 1 &&
      Math.abs(seg1Start.y - seg2End.y) < 1)
  );
};

// Find connection point between two segments
export const findConnectionPoint = (
  segment: { points: Point[] },
  connectedSegment: { points: Point[] }
): Point | null => {
  const seg1End = segment.points[segment.points.length - 1];
  const seg1Start = segment.points[0];
  const seg2Start = connectedSegment.points[0];
  const seg2End = connectedSegment.points[connectedSegment.points.length - 1];

  if (
    Math.abs(seg1End.x - seg2Start.x) < 1 &&
    Math.abs(seg1End.y - seg2Start.y) < 1
  ) {
    return seg1End;
  }
  if (
    Math.abs(seg1Start.x - seg2End.x) < 1 &&
    Math.abs(seg1Start.y - seg2End.y) < 1
  ) {
    return seg1Start;
  }
  return null;
};

// Sort segment indices: non-selected first, then selected
// Maintains relative order within each group for proper z-index layering
export const getSortedSegmentIndices = (
  segments: CableSegment[],
  selectedSegmentIndices: number[]
): number[] => {
  const selectedSet = new Set(selectedSegmentIndices);
  const nonSelected: number[] = [];
  const selected: number[] = [];

  segments.forEach((_, index) => {
    if (selectedSet.has(index)) {
      selected.push(index);
    } else {
      nonSelected.push(index);
    }
  });

  // Return non-selected first, then selected (maintaining relative order)
  // This ensures selected segments render on top (higher z-index)
  return [...nonSelected, ...selected];
};

