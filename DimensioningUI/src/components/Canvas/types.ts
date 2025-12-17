export type Point = {
  x: number;
  y: number;
};

export type CableSegment = {
  points: Point[];
  length: number; // in meters (calculated from pixel distance)
  crossSection?: number; // mm², optional - uses default if not set
  connectedTo?: number; // index of segment this is connected to (for merging)
};

export type Tool = "line" | "crossSection" | "erase";

export type HoveredPoint = {
  segment: number;
  point: number;
};

