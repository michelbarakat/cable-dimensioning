import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";
import { DEFAULTS } from "../../lib/defaults";
import type { TemperaturePreset } from "../Canvas/types";
import { TEMPERATURE_PRESETS } from "../Canvas/types";

const SAMPLE_DATA = {
  current: DEFAULTS.CURRENT,
  temperature: DEFAULTS.TEMPERATURE,
};

type ResultBoxProps = {
  result: number | null;
};

function ResultBox({ result }: ResultBoxProps) {
  const getBoxClasses = () => {
    if (result === null) return "bg-gray-900/50 border-gray-700";
    if (result >= 0) return "bg-gray-900 border-gray-700";
    return "bg-red-900/30 border-red-700";
  };

  const renderContent = () => {
    if (result === null) {
      return (
        <p className="text-gray-500 text-sm">
          <strong className="text-gray-400">Result: </strong>—
        </p>
      );
    }
    if (result >= 0) {
      return (
        <p className="text-white">
          <strong className="text-blue-400">Result: </strong>
          <span className="text-xl font-semibold">{result.toFixed(2)} A</span>
        </p>
      );
    }
    return (
      <p className="text-red-300">
        <strong>Error: </strong>Invalid input
      </p>
    );
  };

  return (
    <div className={`h-[56px] flex items-center p-3 rounded-lg border whitespace-nowrap ${getBoxClasses()}`}>
      {renderContent()}
    </div>
  );
}

type NumberInputProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function NumberInput({ id, name, label, value, onChange }: NumberInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-gray-300 font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const inputValue = e.target.value;
          if (isValidNumberInput(inputValue)) {
            onChange(inputValue);
          }
        }}
        className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
      />
    </div>
  );
}

type FormFieldsProps = {
  current: string;
  temperature: TemperaturePreset;
  deratingFactor: number;
  onCurrentChange: (value: string) => void;
  onTemperatureChange: (value: TemperaturePreset) => void;
  onCalculate: () => void;
  cableEngine: CableEngine | null;
};

function FormFields({
  current,
  temperature,
  deratingFactor,
  onCurrentChange,
  onTemperatureChange,
  onCalculate,
  cableEngine,
}: FormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberInput
          id="derating-current"
          name="derating-current"
          label="Nominal Current (A)"
          value={current}
          onChange={onCurrentChange}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="derating-temperature" className="text-gray-300 font-medium">
            Temperature Preset
          </label>
          <select
            id="derating-temperature"
            name="derating-temperature"
            value={temperature}
            onChange={(e) => onTemperatureChange(e.target.value as TemperaturePreset)}
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
          >
            {Object.keys(TEMPERATURE_PRESETS).map((preset) => (
              <option key={preset} value={preset}>
                {preset} (~{TEMPERATURE_PRESETS[preset as TemperaturePreset]}°C)
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="derating-factor" className="text-gray-300 font-medium">
            Derating Factor (read-only)
          </label>
          <input
            id="derating-factor"
            name="derating-factor"
            type="text"
            value={deratingFactor.toFixed(2)}
            readOnly
            className="bg-gray-900/50 border-2 border-gray-700 rounded-lg p-3 text-gray-400 cursor-not-allowed"
          />
        </div>
      </div>
      <button
        onClick={onCalculate}
        className="mt-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg h-12 cursor-pointer text-white font-semibold transition-colors shadow-lg hover:shadow-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!cableEngine}
      >
        Apply Derating
      </button>
    </>
  );
}

type SampleDataBoxProps = {
  onApply: () => void;
};

function SampleDataBox({ onApply }: SampleDataBoxProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 shadow-lg">
      <div className="text-xs text-gray-400 mb-2 font-semibold">Sample Data</div>
      <table className="text-xs text-gray-300 mb-2">
        <tbody>
          <tr>
            <td className="pr-2">Current:</td>
            <td className="font-mono">{SAMPLE_DATA.current} A</td>
          </tr>
        </tbody>
      </table>
      <button
        onClick={onApply}
        className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1.5 rounded transition-colors cursor-pointer"
      >
        Apply
      </button>
    </div>
  );
}

export default function Derating({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) {
  const [current, setCurrent] = useState<string>("");
  const [temperature, setTemperature] = useState<TemperaturePreset>(DEFAULTS.TEMPERATURE);
  const [result, setResult] = useState<number | null>(null);

  // Derating factor is automatically derived from temperature preset
  const deratingFactor = DEFAULTS.DERATING_FACTORS[temperature];

  const handleApplySample = () => {
    setCurrent(SAMPLE_DATA.current);
  };

  const handleCalculate = async () => {
    if (!cableEngine) {
      alert("Cable engine not loaded");
      return;
    }

    const currentValue = parseNumber(current);
    if (isNaN(currentValue) || currentValue <= 0) {
      alert("Please enter a valid current value");
      return;
    }

    try {
      // applyDerating(baseCurrent, kTemp, kGroup)
      // kTemp is the temperature derating factor
      // kGroup is set to 1 (no group derating)
      const deratedCurrent = await cableEngine.applyDerating(
        currentValue,
        deratingFactor,
        1
      );
      setResult(deratedCurrent);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Error applying derating");
    }
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1 bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-3xl font-bold flex-1 text-white">Current Derating</h2>
          <ResultBox result={result} />
        </div>
        <FormFields
          current={current}
          temperature={temperature}
          deratingFactor={deratingFactor}
          onCurrentChange={setCurrent}
          onTemperatureChange={setTemperature}
          onCalculate={handleCalculate}
          cableEngine={cableEngine}
        />
      </div>
      <SampleDataBox onApply={handleApplySample} />
    </div>
  );
}

