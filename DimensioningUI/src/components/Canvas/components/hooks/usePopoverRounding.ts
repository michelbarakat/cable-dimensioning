import { useEffect, useRef } from "react";
import { parseNumber } from "../../../../lib/numberInput";
import { RANGES } from "../../../../lib/ranges";
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
  onUpdateSegment: (segmentIndex: number, crossSection: number, isCopper: boolean, temperature: TemperaturePreset) => void
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

    if (!wasVisible || isVisible || !popoverDataRef.current || !cableEngine) {
      return;
    }

    const popoverData = popoverDataRef.current;
    roundingCancelRef.current = true;
    roundingCancelRef.current = false;

    const roundOnClose = async () => {
      if (roundingCancelRef.current || !isMountedRef.current) {
        return;
      }

      if (popoverData.segmentIndex >= segmentsCountRef.current) {
        return;
      }

      const numValue = parseNumber(popoverData.crossSection);
      if (!isNaN(numValue) && numValue > 0) {
        try {
          const roundedValue = await cableEngine.roundToStandard(numValue);

          if (roundingCancelRef.current || !isMountedRef.current) {
            return;
          }

          if (popoverData.segmentIndex >= segmentsCountRef.current) {
            return;
          }

          const clampedValue = Math.max(
            RANGES.CROSS_SECTION.MIN,
            Math.min(RANGES.CROSS_SECTION.MAX, roundedValue)
          );
          onUpdateSegmentRef.current(
            popoverData.segmentIndex,
            clampedValue,
            popoverData.isCopper,
            popoverData.temperature
          );
        } catch (error) {
          if (!roundingCancelRef.current) {
            console.error("Error rounding to standard on close:", error);
          }
        }
      }
    };

    roundOnClose();

    return () => {
      roundingCancelRef.current = true;
    };
  }, [popover?.visible, cableEngine, popoverDataRef]);
}
