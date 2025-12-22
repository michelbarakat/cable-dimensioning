import { FormControl, Input } from "@core/ui-headless";
import { DEFAULTS } from "../../../lib/defaults";
import type { PopoverData } from "./SegmentPropertiesPopover.helpers";

type ReadOnlyFieldsProps = {
  popover: PopoverData;
  resistivity: number | null;
  deratedCurrent: number | null;
};

export function ReadOnlyFields({
  popover,
  resistivity,
  deratedCurrent,
}: ReadOnlyFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <FormControl label="Resistivity (Ω·mm²/m)" size="sm">
          <Input
            id="popover-resistivity"
            name="popover-resistivity"
            type="text"
            value={resistivity !== null ? resistivity.toFixed(6) : "—"}
            readOnly
            disabled
            size="sm"
          />
        </FormControl>

        <FormControl label="Derating Factor" size="sm">
          <Input
            id="popover-derating-factor"
            name="popover-derating-factor"
            type="text"
            value={DEFAULTS.DERATING_FACTORS[popover.temperature].toFixed(2)}
            readOnly
            disabled
            size="sm"
          />
        </FormControl>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FormControl label="Derated Current (A)" size="sm">
          <Input
            id="popover-derated-current"
            name="popover-derated-current"
            type="text"
            value={deratedCurrent !== null ? deratedCurrent.toFixed(2) : "—"}
            readOnly
            disabled
            size="sm"
          />
        </FormControl>
      </div>
    </>
  );
}
