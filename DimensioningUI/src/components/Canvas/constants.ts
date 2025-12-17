import { DEFAULTS } from "../../lib/defaults";
import { RANGES } from "../../lib/ranges";

export const SAMPLE_DATA = {
  current: DEFAULTS.CURRENT,
  resistivity: DEFAULTS.RESISTIVITY,
  crossSection: DEFAULTS.CROSS_SECTION.toString(),
  scale: DEFAULTS.SCALE.toString(),
};

// Minimum scale value (pixels per meter)
export const MIN_SCALE = RANGES.SCALE.MIN;
// Maximum scale value (pixels per meter)
export const MAX_SCALE = RANGES.SCALE.MAX;

