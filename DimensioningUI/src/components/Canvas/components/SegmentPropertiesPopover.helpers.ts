import { parseNumber } from "../../../lib/numberInput";
import { DEFAULTS } from "../../../lib/defaults";
import { RANGES } from "../../../lib/ranges";
import { isValidNumberInput } from "../../../lib/numberInput";

const INTERMEDIATE_VALUES = new Set(["", ".", ",", "-"]);

export const isCompleteValue = (value: string): boolean => {
  return !INTERMEDIATE_VALUES.has(value);
};

export const clampCrossSection = (value: number): number => {
  return Math.max(
    RANGES.CROSS_SECTION.MIN,
    Math.min(RANGES.CROSS_SECTION.MAX, value)
  );
};

import type { TemperaturePreset } from "../../types";

export type PopoverData = {
  visible: boolean;
  x: number;
  y: number;
  segmentIndex: number;
  crossSection: string;
  isCopper: boolean;
  temperature: TemperaturePreset;
};

export const applySegmentUpdate = (
  updatedPopover: PopoverData,
  onUpdateSegment: (segmentIndex: number, crossSection: number, isCopper: boolean, temperature: TemperaturePreset) => void,
  currentCrossSection?: number
) => {
  // Use current segment's cross-section if popover value is invalid, otherwise use popover value
  const numValue = parseNumber(updatedPopover.crossSection);
  const crossSectionToUse = !isNaN(numValue) && numValue > 0
    ? numValue
    : (currentCrossSection ?? DEFAULTS.CROSS_SECTION);
  const clampedValue = clampCrossSection(crossSectionToUse);
  onUpdateSegment(
    updatedPopover.segmentIndex,
    clampedValue,
    updatedPopover.isCopper,
    updatedPopover.temperature
  );
};

export const handleCrossSectionChange = (
  value: string,
  popover: PopoverData | null,
  setPopover: (popover: PopoverData | null) => void,
  onUpdateSegment: (segmentIndex: number, crossSection: number, isCopper: boolean, temperature: TemperaturePreset) => void
) => {
  if (!popover || !isValidNumberInput(value)) return;
  
  const updatedPopover = { ...popover, crossSection: value };
  setPopover(updatedPopover);
  if (isCompleteValue(value)) {
    applySegmentUpdate(updatedPopover, onUpdateSegment);
  }
};
