import { useState, useCallback } from "react";
import { parseNumber } from "../../../../lib/numberInput";
import { clampCrossSection, applySegmentUpdate } from "../SegmentPropertiesPopover.helpers";
import type { PopoverData } from "../SegmentPropertiesPopover.helpers";
import type { CableEngine } from "../../../../lib/cable_dimensioning";
import type { TemperaturePreset } from "../../../types";

export function useRoundToStandard(
  popover: PopoverData | null,
  setPopover: (popover: PopoverData | null) => void,
  cableEngine: CableEngine | null,
  onUpdateSegment: (segmentIndex: number, crossSection: number, isCopper: boolean, temperature: TemperaturePreset) => void
) {
  const [isRounding, setIsRounding] = useState(false);

  const handleRoundToStandard = useCallback(async () => {
    if (!cableEngine || !popover) return;
    
    const numValue = parseNumber(popover.crossSection);
    if (isNaN(numValue) || numValue <= 0) return;

    setIsRounding(true);
    try {
      const roundedValue = await cableEngine.roundToStandard(numValue);
      const clampedValue = clampCrossSection(roundedValue);
      const updatedPopover = { ...popover, crossSection: clampedValue.toString() };
      setPopover(updatedPopover);
      applySegmentUpdate(updatedPopover, onUpdateSegment);
    } catch (error) {
      console.error("Error rounding to standard:", error);
    } finally {
      setIsRounding(false);
    }
  }, [cableEngine, popover, setPopover, onUpdateSegment]);

  return { isRounding, handleRoundToStandard };
}
