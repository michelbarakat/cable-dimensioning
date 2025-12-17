/**
 * Minimum and maximum ranges for input validation
 */

export const RANGES = {
  // Cross Section (mm²)
  CROSS_SECTION: {
    MIN: 1.5,
    MAX: 35,
  },

  // Current (Amperes)
  CURRENT: {
    MIN: 0.1,
    MAX: 1000,
  },

  // Resistivity (Ω·mm²/m)
  RESISTIVITY: {
    MIN: 0.001,
    MAX: 1.0,
  },

  // Scale (pixels per meter)
  SCALE: {
    MIN: 100,
    MAX: 1500,
  },

  // Length (meters)
  LENGTH: {
    MIN: 0.01,
    MAX: 10000,
  },

  // Voltage Drop (Volts)
  VOLTAGE_DROP: {
    MIN: 0.001,
    MAX: 1000,
  },
} as const;
