/**
 * Default values used throughout the application
 */

export const DEFAULTS = {
  // Current (Amperes)
  CURRENT: "16",

  // Resistivity (Ω·mm²/m)
  RESISTIVITY: "0.0175",

  // Cross Section (mm²)
  CROSS_SECTION: 2.5,

  // Scale (pixels per meter)
  SCALE: 300,

  // Material
  IS_COPPER: true,
} as const;
