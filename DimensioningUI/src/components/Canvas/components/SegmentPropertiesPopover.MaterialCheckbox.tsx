import { FormControl, Checkbox } from "@core/ui-headless";
import { applySegmentUpdate } from "./SegmentPropertiesPopover.helpers";
import type { PopoverData } from "./SegmentPropertiesPopover.helpers";
import type { TemperaturePreset } from "../types";

type MaterialCheckboxProps = {
  popover: PopoverData;
  setPopover: (popover: PopoverData | null) => void;
  onUpdateSegment: (segmentIndex: number, crossSection: number, isCopper: boolean, temperature: TemperaturePreset) => void;
};

export function MaterialCheckbox({
  popover,
  setPopover,
  onUpdateSegment,
}: MaterialCheckboxProps) {
  return (
    <FormControl size="sm">
      <Checkbox
        id="popover-copper"
        checked={popover.isCopper}
        onCheckedChange={(checked) => {
          const isCopper = checked === true;
          const updatedPopover = { ...popover, isCopper };
          setPopover(updatedPopover);
          applySegmentUpdate(updatedPopover, onUpdateSegment);
        }}
        label="Copper?"
        size="sm"
      />
    </FormControl>
  );
}
