import { useEffect, useRef, useCallback } from "react";
import type { CableEngine } from "../../../lib/cable_dimensioning";
import type { TemperaturePreset } from "../types";
import { usePopoverRounding } from "./hooks/usePopoverRounding";
import { usePopoverCalculations } from "./hooks/usePopoverCalculations";
import { useEscapeKey } from "./hooks/useEscapeKey";
import { useRoundToStandard } from "./hooks/useRoundToStandard";
import { CrossSectionInput } from "./SegmentPropertiesPopover.CrossSectionInput";
import { MaterialCheckbox } from "./SegmentPropertiesPopover.MaterialCheckbox";
import { TemperatureSelect } from "./SegmentPropertiesPopover.TemperatureSelect";
import { ReadOnlyFields } from "./SegmentPropertiesPopover.ReadOnlyFields";

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
  segmentsCount: number;
  segments: Array<{ crossSection?: number }>;
};

export function SegmentPropertiesPopover({
  popover,
  setPopover,
  onUpdateSegment,
  cableEngine,
  current,
  segmentsCount,
  segments,
}: SegmentPropertiesPopoverProps) {
  const popoverDataRef = useRef<typeof popover>(null);

  const { resistivity, deratedCurrent } = usePopoverCalculations(popover, current, cableEngine);
  const { isRounding, handleRoundToStandard } = useRoundToStandard(popover, setPopover, cableEngine, onUpdateSegment);

  // Keep popoverDataRef in sync with popover state so closing saves current values
  useEffect(() => {
    if (popover?.visible) {
      popoverDataRef.current = popover;
    }
  }, [popover]);

  usePopoverRounding(popover, popoverDataRef, cableEngine, segmentsCount, onUpdateSegment, segments);

  const handleEscape = useCallback(() => {
    setPopover(null);
  }, [setPopover]);

  useEscapeKey(popover?.visible ?? false, handleEscape);

  if (!popover || !popover.visible) return null;


  return (
    <div
      data-popover
      className="absolute bg-surface border border-section-border rounded-lg shadow-xl p-2 min-w-48 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${popover.x}px`,
        top: `${popover.y}px`,
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-2">
        <CrossSectionInput
          popover={popover}
          setPopover={setPopover}
          onUpdateSegment={onUpdateSegment}
          onRound={handleRoundToStandard}
          isRounding={isRounding}
          cableEngine={cableEngine}
        />

        <MaterialCheckbox
          popover={popover}
          setPopover={setPopover}
          onUpdateSegment={onUpdateSegment}
          segments={segments}
        />

        <TemperatureSelect
          popover={popover}
          setPopover={setPopover}
          onUpdateSegment={onUpdateSegment}
          segments={segments}
        />

        <ReadOnlyFields
          popover={popover}
          resistivity={resistivity}
          deratedCurrent={deratedCurrent}
        />

        <div className="text-xs text-tertiary text-center mt-1">
          Press ESC to close
        </div>
      </div>
    </div>
  );
}
