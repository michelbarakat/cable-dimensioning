export type Point = {
  x: number;
  y: number;
};

export type CableSegment = {
  points: Point[];
  length: number; // in meters (calculated from pixel distance)
  crossSection?: number; // mm², optional - uses default from DEFAULTS.CROSS_SECTION if not set
  isCopper?: boolean; // uses default from DEFAULTS.IS_COPPER if not set
  connectedTo?: number; // index of segment this is connected to (for merging)
};

export type Tool = "line" | "erase";

export type HoveredPoint = {
  segment: number;
  point: number;
};

