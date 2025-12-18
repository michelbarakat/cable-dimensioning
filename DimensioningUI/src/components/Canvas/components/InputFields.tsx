import { isValidNumberInput, parseNumber } from "../../../lib/numberInput";
import { RANGES } from "../../../lib/ranges";

type InputFieldsProps = {
  current: string;
  isThreePhase: boolean;
  setCurrent: (value: string) => void;
  setIsThreePhase: (value: boolean) => void;
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
}: InputFieldsProps) {
  const handleCurrentChange = createNumberInputHandler(
    setCurrent,
    RANGES.CURRENT.MIN,
    RANGES.CURRENT.MAX
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="canvas-current" className="text-gray-300 font-medium">
          Current (A) [{RANGES.CURRENT.MIN} - {RANGES.CURRENT.MAX}]
        </label>
        <input
          id="canvas-current"
          name="canvas-current"
          type="text"
          inputMode="decimal"
          value={current}
          onChange={handleCurrentChange}
          className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="three-phase-toggle"
          checked={isThreePhase}
          onChange={(e) => setIsThreePhase(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label
          htmlFor="three-phase-toggle"
          className="text-gray-300 font-medium cursor-pointer"
        >
          Three Phase
        </label>
      </div>
    </div>
  );
}
