import { FormControl, Checkbox } from "@core/ui-headless";
import type { PopoverData } from "./SegmentPropertiesPopover.helpers";
import type { TemperaturePreset } from "../types";

type MaterialCheckboxProps = {
  popover: PopoverData;
  setPopover: (popover: PopoverData | null) => void;
  onUpdateSegment: (segmentIndex: number, crossSection: number, isCopper: boolean, temperature: TemperaturePreset) => void;
  segments: Array<{ crossSection?: number }>;
};

export function MaterialCheckbox({
  popover,
  setPopover,
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
          // Don't update immediately - let usePopoverRounding handle it on close
        }}
        label="Copper?"
        size="sm"
      />
    </FormControl>
  );
}
