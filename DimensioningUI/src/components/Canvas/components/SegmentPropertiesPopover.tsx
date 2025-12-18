import { useEffect, useState, useRef } from "react";
import { isValidNumberInput, parseNumber } from "../../../lib/numberInput";
import { DEFAULTS } from "../../../lib/defaults";
import { RANGES } from "../../../lib/ranges";
import type { CableEngine } from "../../../lib/cable_dimensioning";
import type { TemperaturePreset } from "../types";
import { TEMPERATURE_PRESETS } from "../types";

type SegmentPropertiesPopoverProps = {
  popover: {
    visible: boolean;
    x: number;
    y: number;
    segmentIndex: number;
    crossSection: string; // Store as string to allow intermediate states like "2."
    isCopper: boolean;
    temperature: TemperaturePreset;
  } | null;
  setPopover: (
    popover: {
      visible: boolean;
      x: number;
      y: number;
      segmentIndex: number;
      crossSection: string;
      isCopper: boolean;
      temperature: TemperaturePreset;
    } | null
  ) => void;
  onUpdateSegment: (segmentIndex: number, crossSection: number, isCopper: boolean, temperature: TemperaturePreset) => void;
  cableEngine: CableEngine | null;
  current: string;
};

export function SegmentPropertiesPopover({
  popover,
  setPopover,
  onUpdateSegment,
  cableEngine,
  current,
}: SegmentPropertiesPopoverProps) {
  const [isRounding, setIsRounding] = useState(false);
  const [resistivity, setResistivity] = useState<number | null>(null);
  const [deratedCurrent, setDeratedCurrent] = useState<number | null>(null);
  const popoverDataRef = useRef<typeof popover>(null);

  // Store popover data when visible
  useEffect(() => {
    if (popover?.visible) {
      popoverDataRef.current = popover;
    }
  }, [popover]);

  // Round value when popover closes
  useEffect(() => {
    const wasVisible = popoverDataRef.current?.visible ?? false;
    const isVisible = popover?.visible ?? false;

    if (wasVisible && !isVisible && popoverDataRef.current && cableEngine) {
      const popoverData = popoverDataRef.current;
      const roundOnClose = async () => {
        const numValue = parseNumber(popoverData.crossSection);
        if (!isNaN(numValue) && numValue > 0) {
          try {
            const roundedValue = await cableEngine.roundToStandard(numValue);
            const clampedValue = Math.max(
              RANGES.CROSS_SECTION.MIN,
              Math.min(RANGES.CROSS_SECTION.MAX, roundedValue)
            );
            onUpdateSegment(popoverData.segmentIndex, clampedValue, popoverData.isCopper, popoverData.temperature);
          } catch (error) {
            console.error("Error rounding to standard on close:", error);
          }
        }
      };
      roundOnClose();
    }
  }, [popover?.visible, cableEngine, onUpdateSegment]);

  // Handle ESC key to close popover - must be called before early return
  useEffect(() => {
    if (!popover?.visible) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPopover(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [popover?.visible, setPopover]);

  // Calculate resistivity when popover data changes (material-based only, at reference 20°C)
  useEffect(() => {
    if (!popover?.visible) {
      setResistivity(null);
      setDeratedCurrent(null);
      return;
    }

    // Use reference resistivity at 20°C based on material only
    const resistivityValue = popover.isCopper
      ? DEFAULTS.RESISTIVITY_COPPER
      : DEFAULTS.RESISTIVITY_ALUMINUM;
    setResistivity(resistivityValue);

    // Calculate derated current
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
      // applyDerating(baseCurrent, kTemp, kGroup) - we only use temperature derating, so kGroup = 1
      const derated = await cableEngine.applyDerating(currentValue, deratingFactor, 1);
      setDeratedCurrent(derated);
    };

    calculateDeratedCurrent();
  }, [popover?.visible, popover?.isCopper, popover?.temperature, current, cableEngine]);

  if (!popover || !popover.visible) return null;

  const INTERMEDIATE_VALUES = new Set(["", ".", ",", "-"]);
  const isCompleteValue = (value: string): boolean => {
    return !INTERMEDIATE_VALUES.has(value);
  };

  const clampCrossSection = (value: number): number => {
    return Math.max(
      RANGES.CROSS_SECTION.MIN,
      Math.min(RANGES.CROSS_SECTION.MAX, value)
    );
  };

  const applySegmentUpdate = (updatedPopover: NonNullable<typeof popover>) => {
    const numValue = parseNumber(updatedPopover.crossSection) || DEFAULTS.CROSS_SECTION;
    const clampedValue = clampCrossSection(numValue);
    onUpdateSegment(
      updatedPopover.segmentIndex,
      clampedValue,
      updatedPopover.isCopper,
      updatedPopover.temperature
    );
  };

  const handleCrossSectionChange = (value: string) => {
    if (isValidNumberInput(value)) {
      const updatedPopover = { ...popover, crossSection: value };
      setPopover(updatedPopover);
      // Apply changes immediately (only if value is complete, not intermediate like "2.")
      if (isCompleteValue(value)) {
        applySegmentUpdate(updatedPopover);
      }
    }
  };

  const handleRoundToStandard = async () => {
    if (!cableEngine || !popover) return;
    
    const numValue = parseNumber(popover.crossSection);
    if (isNaN(numValue) || numValue <= 0) return;

    setIsRounding(true);
    try {
      const roundedValue = await cableEngine.roundToStandard(numValue);
      const clampedValue = clampCrossSection(roundedValue);
      const updatedPopover = { ...popover, crossSection: clampedValue.toString() };
      setPopover(updatedPopover);
      applySegmentUpdate(updatedPopover);
    } catch (error) {
      console.error("Error rounding to standard:", error);
    } finally {
      setIsRounding(false);
    }
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isCopper = e.target.checked;
    const updatedPopover = { ...popover, isCopper };
    setPopover(updatedPopover);
    applySegmentUpdate(updatedPopover);
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const temperature = e.target.value as TemperaturePreset;
    const updatedPopover = { ...popover, temperature };
    setPopover(updatedPopover);
    applySegmentUpdate(updatedPopover);
  };

  return (
    <div
      className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 p-4 min-w-[200px]"
      style={{
        left: `${popover.x}px`,
        top: `${popover.y}px`,
        transform: "translateX(-50%)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-3">
        <label className="text-gray-300 text-xs mb-1 block">
          Cross Section (mm²) [{RANGES.CROSS_SECTION.MIN} - {RANGES.CROSS_SECTION.MAX}]
          <br />
          This will be rounded to the nearest standard size.
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={popover.crossSection}
            onChange={(e) => handleCrossSectionChange(e.target.value)}
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none transition-colors flex-1 text-sm"
            autoFocus
          />
          <button
            type="button"
            onClick={handleRoundToStandard}
            disabled={!cableEngine || isRounding}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
            title="Round to nearest standard size"
          >
            {isRounding ? "..." : "Round"}
          </button>
        </div>
      </div>
      
      <div className="mb-3">
        <label className="text-gray-300 text-xs flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={popover.isCopper}
            onChange={handleMaterialChange}
            className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2"
          />
          <span>Copper?</span>
        </label>
      </div>

      <div className="mb-3">
        <label className="text-gray-300 text-xs mb-1 block">
          Temperature
        </label>
        <select
          value={popover.temperature}
          onChange={handleTemperatureChange}
          className="bg-gray-900 border-2 border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none transition-colors w-full text-sm"
        >
          {Object.keys(TEMPERATURE_PRESETS).map((preset) => (
            <option key={preset} value={preset}>
              {preset} (~{TEMPERATURE_PRESETS[preset as TemperaturePreset]}°C)
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="text-gray-300 text-xs mb-1 block">
          Resistivity (Ω·mm²/m)
        </label>
        <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-2 text-gray-400 text-sm">
          {resistivity !== null ? resistivity.toFixed(6) : "—"}
        </div>
      </div>

      <div className="mb-3">
        <label className="text-gray-300 text-xs mb-1 block">
          Derating Factor ({popover.temperature})
        </label>
        <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-2 text-gray-400 text-sm">
          {DEFAULTS.DERATING_FACTORS[popover.temperature].toFixed(2)}
        </div>
      </div>

      <div className="mb-3">
        <label className="text-gray-300 text-xs mb-1 block">
          Derated Current (A)
        </label>
        <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-2 text-gray-400 text-sm">
          {deratedCurrent !== null ? deratedCurrent.toFixed(2) : "—"}
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center mt-2">
        Press ESC to close
      </div>
    </div>
  );
}
