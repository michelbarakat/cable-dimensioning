import { isValidNumberInput } from "../../../lib/numberInput";

type InputFieldsProps = {
  current: string;
  resistivity: string;
  setCurrent: (value: string) => void;
  setResistivity: (value: string) => void;
};

export function InputFields({
  current,
  resistivity,
  setCurrent,
  setResistivity,
}: InputFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="canvas-current"
          className="text-gray-300 font-medium"
        >
          Current (A)
        </label>
        <input
          id="canvas-current"
          name="canvas-current"
          type="text"
          inputMode="decimal"
          value={current}
          onChange={(e) => {
            const value = e.target.value;
            if (isValidNumberInput(value)) {
              setCurrent(value);
            }
          }}
          className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="canvas-resistivity"
          className="text-gray-300 font-medium"
        >
          Resistivity (Ω·mm²/m)
        </label>
        <input
          id="canvas-resistivity"
          name="canvas-resistivity"
          type="text"
          inputMode="decimal"
          value={resistivity}
          onChange={(e) => {
            const value = e.target.value;
            if (isValidNumberInput(value)) {
              setResistivity(value);
            }
          }}
          className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
}

