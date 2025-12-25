import { useState, useEffect } from "react";
import { Button, FormControl, Input } from "@core/ui-headless";
import { isValidNumberInput, parseNumber } from "../../../lib/numberInput";
import { useEscapeKey } from "./hooks/useEscapeKey";

type CalibrationPopoverProps = {
  popover: {
    visible: boolean;
    x: number;
    y: number;
    lineLength: number; // in pixels
  } | null;
  setPopover: (popover: CalibrationPopoverProps["popover"]) => void;
  onCalibrate: (actualLengthMm: number, lineLengthPx: number) => void;
};

export function CalibrationPopover({
  popover,
  setPopover,
  onCalibrate,
}: CalibrationPopoverProps) {
  const [dimension, setDimension] = useState<string>("");

  useEscapeKey(popover?.visible ?? false, () => {
    if (popover?.visible) {
      setPopover(null);
      setDimension("");
    }
  });

  useEffect(() => {
    if (popover?.visible) {
      setDimension("");
    }
  }, [popover?.visible]);

  const handleSubmit = () => {
    if (!popover || !dimension) return;
    const actualLengthMm = parseNumber(dimension);
    if (!isNaN(actualLengthMm) && actualLengthMm > 0) {
      onCalibrate(actualLengthMm, popover.lineLength);
      setPopover(null);
      setDimension("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!popover?.visible) return null;

  return (
    <div
      data-popover
      className="bg-surface border border-section-border rounded-sm p-3 shadow-lg flex flex-col gap-2 min-w-48"
      style={{
        position: "fixed",
        left: `${popover.x}px`,
        top: `${popover.y}px`,
        zIndex: 1000,
        transform: "translate(-50%, -100%)",
        marginTop: "-8px",
      }}
    >
        <div className="text-sm font-semibold text-text-primary">
          Enter Known Dimension
        </div>
        <FormControl label="Length (mm)">
          <Input
            id="calibration-dimension"
            name="calibration-dimension"
            type="text"
            inputMode="decimal"
            value={dimension}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                setDimension(value);
              }
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="e.g., 5000"
          />
        </FormControl>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant="solid"
            color="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!dimension || isNaN(parseNumber(dimension)) || parseNumber(dimension) <= 0}
          >
            Calibrate
          </Button>
          <Button
            variant="soft"
            color="neutral"
            size="sm"
            onClick={() => {
              setPopover(null);
              setDimension("");
            }}
          >
            Cancel
          </Button>
        </div>
    </div>
  );
}
