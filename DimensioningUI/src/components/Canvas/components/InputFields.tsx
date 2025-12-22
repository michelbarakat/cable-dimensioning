import { isValidNumberInput, parseNumber } from "../../../lib/numberInput";
import { RANGES } from "../../../lib/ranges";
import { FormControl, Input, Checkbox, MetricCard } from "@core/ui-headless";
import { CanvasStats } from "./CanvasStats";

type InputFieldsProps = {
  current: string;
  isThreePhase: boolean;
  setCurrent: (value: string) => void;
  setIsThreePhase: (value: boolean) => void;
  result: number | null;
  totalSegments: number;
  totalLength: number;
};

const INTERMEDIATE_VALUES = ["", ".", ",", "-"];

const isIntermediateValue = (value: string): boolean => {
  return INTERMEDIATE_VALUES.includes(value);
};

const isWithinRange = (numValue: number, min: number, max: number): boolean => {
  return numValue >= min && numValue <= max;
};

const isValidValue = (
  value: string,
  numValue: number,
  min: number,
  max: number
): boolean => {
  return isIntermediateValue(value) || isWithinRange(numValue, min, max);
};

const createNumberInputHandler = (
  setValue: (value: string) => void,
  min: number,
  max: number
) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValidInput = isValidNumberInput(value);
    const numValue = parseNumber(value);
    const shouldUpdate =
      isValidInput && isValidValue(value, numValue, min, max);

    if (shouldUpdate) {
      setValue(value);
    }
  };
};

export function InputFields({
  current,
  isThreePhase,
  setCurrent,
  setIsThreePhase,
  result,
  totalSegments,
  totalLength,
}: InputFieldsProps) {
  const handleCurrentChange = createNumberInputHandler(
    setCurrent,
    RANGES.CURRENT.MIN,
    RANGES.CURRENT.MAX
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div className="flex flex-col gap-2">
        <FormControl label={`Current (A) [${RANGES.CURRENT.MIN} - ${RANGES.CURRENT.MAX}]`}>
          <Input
            id="canvas-current"
            name="canvas-current"
            type="text"
            inputMode="decimal"
            value={current}
            onChange={handleCurrentChange}
          />
        </FormControl>

        <FormControl>
          <Checkbox
            id="three-phase-toggle"
            checked={isThreePhase}
            onCheckedChange={() => setIsThreePhase(!isThreePhase)}
            label="Three Phase"
          />
        </FormControl>
      </div>

      <div className="flex flex-col gap-2">
        <MetricCard
          className="w-full"
          label=""
          value={
            result !== null && result >= 0 && !isNaN(result)
              ? result.toFixed(6)
              : "—"
          }
          unit="Volts"
          badgeTitle="Total Voltage Drop"
        />
        <CanvasStats
          totalSegments={totalSegments}
          totalLength={totalLength}
        />
      </div>
    </div>
  );
}
