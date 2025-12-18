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

  // Temperature preset
  TEMPERATURE: "Normal Indoor" as const,

  // Resistivity at reference temperature (20°C) - Ω·mm²/m
  RESISTIVITY_COPPER: 0.017241,
  RESISTIVITY_ALUMINUM: 0.028265,

  // Derating factors based on temperature
  DERATING_FACTORS: {
    "Normal Indoor": 1.08, // 20°C
    "Warm Space": 0.91,    // 40°C
    "Hot Area": 0.82,       // 50°C
  } as const,
} as const;
