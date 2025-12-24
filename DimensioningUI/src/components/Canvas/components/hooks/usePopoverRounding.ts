import { useEffect, useRef } from "react";
import { parseNumber } from "../../../../lib/numberInput";
import { RANGES } from "../../../../lib/ranges";
import { DEFAULTS } from "../../../../lib/defaults";
import type { CableEngine } from "../../../../lib/cable_dimensioning";
import type { TemperaturePreset } from "../../types";

type PopoverData = {
  visible: boolean;
  x: number;
  y: number;
  segmentIndex: number;
  crossSection: string;
  isCopper: boolean;
  temperature: TemperaturePreset;
};

export function usePopoverRounding(
  popover: PopoverData | null,
  popoverDataRef: React.MutableRefObject<PopoverData | null>,
  cableEngine: CableEngine | null,
  segmentsCount: number,
  onUpdateSegment: (segmentIndex: number, crossSection: number, isCopper: boolean, temperature: TemperaturePreset) => void,
  segments: Array<{ crossSection?: number }>
) {
  const isMountedRef = useRef<boolean>(true);
  const roundingCancelRef = useRef<boolean>(false);
  const onUpdateSegmentRef = useRef(onUpdateSegment);
  const segmentsCountRef = useRef(segmentsCount);

  useEffect(() => {
    onUpdateSegmentRef.current = onUpdateSegment;
  }, [onUpdateSegment]);

  useEffect(() => {
    segmentsCountRef.current = segmentsCount;
  }, [segmentsCount]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      roundingCancelRef.current = true;
    };
  }, []);

  useEffect(() => {
    const wasVisible = popoverDataRef.current?.visible ?? false;
    const isVisible = popover?.visible ?? false;

    // Update ref whenever popover is visible to keep it in sync with latest values
    if (isVisible && popover) {
      popoverDataRef.current = popover;
    }

    // Only run when popover transitions from visible to hidden
    if (!wasVisible || isVisible || !popoverDataRef.current) {
      return;
    }

    // Capture the latest popover data from ref (which should be up-to-date)
    const popoverData = popoverDataRef.current;
    roundingCancelRef.current = true;
    roundingCancelRef.current = false;

    const saveOnClose = async () => {
      if (roundingCancelRef.current || !isMountedRef.current) {
        return;
      }

      if (popoverData.segmentIndex >= segmentsCountRef.current) {
        return;
      }

      const numValue = parseNumber(popoverData.crossSection);
      // Get current segment's cross-section as fallback
      const currentSegment = segments[popoverData.segmentIndex];
      const currentCrossSection = currentSegment?.crossSection ?? DEFAULTS.CROSS_SECTION;
      let crossSectionToSave: number;
      
      // Try to round if cableEngine is available and value is valid
      if (cableEngine && !isNaN(numValue) && numValue > 0) {
        try {
          const roundedValue = await cableEngine.roundToStandard(numValue);

          if (roundingCancelRef.current || !isMountedRef.current) {
            return;
          }

          if (popoverData.segmentIndex >= segmentsCountRef.current) {
            return;
          }

          crossSectionToSave = roundedValue;
        } catch (error) {
          if (!roundingCancelRef.current) {
            console.error("Error rounding to standard on close:", error);
          }
          // Use current value if rounding fails
          crossSectionToSave = numValue;
        }
      } else {
        // Use popover value if valid, otherwise use current segment's cross-section
        crossSectionToSave = !isNaN(numValue) && numValue > 0
          ? numValue
          : currentCrossSection;
      }
      
      // Final check before saving
      if (roundingCancelRef.current || !isMountedRef.current) {
        return;
      }

      if (popoverData.segmentIndex >= segmentsCountRef.current) {
        return;
      }

      // Save all popover values (cross-section, isCopper, temperature) when closing
      const clampedValue = Math.max(
        RANGES.CROSS_SECTION.MIN,
        Math.min(RANGES.CROSS_SECTION.MAX, crossSectionToSave)
      );
      
      onUpdateSegmentRef.current(
        popoverData.segmentIndex,
        clampedValue,
        popoverData.isCopper,
        popoverData.temperature
      );
    };

    saveOnClose();

    return () => {
      roundingCancelRef.current = true;
    };
  }, [popover, cableEngine, popoverDataRef, segments]);
}
