import { FormControl, Input, MicroButton, Tooltip } from "@core/ui-headless";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp03Icon } from "@hugeicons-pro/core-stroke-rounded";
import { RANGES } from "../../../lib/ranges";
import { handleCrossSectionChange } from "./SegmentPropertiesPopover.helpers";
import type { PopoverData } from "./SegmentPropertiesPopover.helpers";
import type { TemperaturePreset } from "../types";

type CrossSectionInputProps = {
  popover: PopoverData;
  setPopover: (popover: PopoverData | null) => void;
  onUpdateSegment: (segmentIndex: number, crossSection: number, isCopper: boolean, temperature: TemperaturePreset) => void;
  onRound: () => void;
  isRounding: boolean;
  cableEngine: any;
};

export function CrossSectionInput({
  popover,
  setPopover,
  onUpdateSegment,
  onRound,
  isRounding,
  cableEngine,
}: CrossSectionInputProps) {
  return (
    <FormControl
      label={`Cross Section (mm²) [${RANGES.CROSS_SECTION.MIN}-${RANGES.CROSS_SECTION.MAX}]`}
      helperText={[{ text: "Rounded to nearest standard size" }]}
      size="sm"
    >
      <Input
        id="popover-cross-section"
        name="popover-cross-section"
        type="text"
        inputMode="decimal"
        value={popover.crossSection}
        onChange={(e) => handleCrossSectionChange(e.target.value, popover, setPopover, onUpdateSegment)}
        size="sm"
        autoFocus
        endButton={
          <Tooltip content="Round to nearest standard size" size="sm">
            <MicroButton
              icon={<HugeiconsIcon icon={ArrowUp03Icon} />}
              onClick={onRound}
              disabled={!cableEngine || isRounding}
              color="primary"
            />
          </Tooltip>
        }
      />
    </FormControl>
  );
}
