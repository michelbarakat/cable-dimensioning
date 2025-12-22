import { useEffect, useState } from "react";
import { parseNumber } from "../../../../lib/numberInput";
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

export function usePopoverCalculations(
  popover: PopoverData | null,
  current: string,
  cableEngine: CableEngine | null
) {
  const [resistivity, setResistivity] = useState<number | null>(null);
  const [deratedCurrent, setDeratedCurrent] = useState<number | null>(null);

  useEffect(() => {
    if (!popover?.visible) {
      setResistivity(null);
      setDeratedCurrent(null);
      return;
    }

    const resistivityValue = popover.isCopper
      ? DEFAULTS.RESISTIVITY_COPPER
      : DEFAULTS.RESISTIVITY_ALUMINUM;
    setResistivity(resistivityValue);

    const calculateDeratedCurrent = async () => {
      if (!cableEngine) {
        setDeratedCurrent(null);
        return;
      }

      const currentValue = parseNumber(current);
      if (isNaN(currentValue) || currentValue <= 0) {
        setDeratedCurrent(null);
        return;
      }

      const deratingFactor = DEFAULTS.DERATING_FACTORS[popover.temperature];
      const derated = await cableEngine.applyDerating(currentValue, deratingFactor, 1);
      setDeratedCurrent(derated);
    };

    calculateDeratedCurrent();
  }, [popover?.visible, popover?.isCopper, popover?.temperature, current, cableEngine]);

  return { resistivity, deratedCurrent };
}
