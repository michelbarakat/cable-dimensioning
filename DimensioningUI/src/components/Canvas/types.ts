export type Point = {
  x: number;
  y: number;
};

export type TemperaturePreset = "Normal Indoor" | "Warm Space" | "Hot Area";

export const TEMPERATURE_PRESETS: Record<TemperaturePreset, number> = {
  "Normal Indoor": 20,
  "Warm Space": 40,
  "Hot Area": 50,
} as const;

export type CableSegment = {
  points: Point[];
  length: number; // in meters (calculated from pixel distance)
  crossSection?: number; // mm², optional - uses default from DEFAULTS.CROSS_SECTION if not set
  isCopper?: boolean; // uses default from DEFAULTS.IS_COPPER if not set
  temperature?: TemperaturePreset; // uses default from DEFAULTS.TEMPERATURE if not set
  connectedTo?: number; // index of segment this is connected to (for merging)
};

export type Tool = "line" | "erase" | "select";

export type HoveredPoint = {
  segment: number;
  point: number;
};

