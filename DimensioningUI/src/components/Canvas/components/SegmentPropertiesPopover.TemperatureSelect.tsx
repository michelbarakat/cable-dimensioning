import { FormControl, Select } from "@core/ui-headless";
import { TEMPERATURE_PRESETS } from "../types";
import type { PopoverData } from "./SegmentPropertiesPopover.helpers";
import type { TemperaturePreset } from "../types";

type TemperatureSelectProps = {
  popover: PopoverData;
  setPopover: (popover: PopoverData | null) => void;
  onUpdateSegment: (segmentIndex: number, crossSection: number, isCopper: boolean, temperature: TemperaturePreset) => void;
  segments: Array<{ crossSection?: number }>;
};

export function TemperatureSelect({
  popover,
  setPopover,
}: TemperatureSelectProps) {
  
  return (
    <FormControl label="Temperature" size="sm">
      <Select
        name="popover-temperature"
        value={popover.temperature}
        onValueChange={(value) => {
          const temperature = value as TemperaturePreset;
          const updatedPopover = { ...popover, temperature };
          setPopover(updatedPopover);
          // Don't update immediately - let usePopoverRounding handle it on close
        }}
        options={Object.keys(TEMPERATURE_PRESETS).map((preset) => ({
          label: `${preset} (~${TEMPERATURE_PRESETS[preset as TemperaturePreset]}°C)`,
          value: preset,
        }))}
        size="sm"
      />
    </FormControl>
  );
}
