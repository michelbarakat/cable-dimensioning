import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";

const SAMPLE_DATA = {
  current: "16",
  length: "25",
  resistivity: "0.0175",
  crossSection: "2.5",
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
          <span className="text-xl font-semibold">{result.toFixed(6)} Volts</span>
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

type FormFieldsProps = {
  current: string;
  length: string;
  resistivity: string;
  crossSection: string;
  onCurrentChange: (value: string) => void;
  onLengthChange: (value: string) => void;
  onResistivityChange: (value: string) => void;
  onCrossSectionChange: (value: string) => void;
  onCalculate: () => void;
};

function FormFields({
  current,
  length,
  resistivity,
  crossSection,
  onCurrentChange,
  onLengthChange,
  onResistivityChange,
  onCrossSectionChange,
  onCalculate,
}: FormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="three-current" className="text-gray-300 font-medium">
            Current in A
          </label>
          <input
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
            type="text"
            inputMode="decimal"
            id="three-current"
            value={current}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                onCurrentChange(value);
              }
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="three-length" className="text-gray-300 font-medium">
            Length in meters
          </label>
          <input
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
            type="text"
            inputMode="decimal"
            id="three-length"
            value={length}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                onLengthChange(value);
              }
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="three-resistivity" className="text-gray-300 font-medium">
            Resistivity in ohm·mm²/m
          </label>
          <input
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
            type="text"
            inputMode="decimal"
            id="three-resistivity"
            value={resistivity}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                onResistivityChange(value);
              }
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="three-crossSection" className="text-gray-300 font-medium">
            Cross Section in mm²
          </label>
          <input
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
            type="text"
            inputMode="decimal"
            id="three-crossSection"
            value={crossSection}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                onCrossSectionChange(value);
              }
            }}
          />
        </div>
      </div>
      <button
        className="mt-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg h-12 cursor-pointer text-white font-semibold transition-colors shadow-lg hover:shadow-xl w-full"
        onClick={onCalculate}
      >
        Calculate
      </button>
    </>
  );
}

type SampleDataBoxProps = {
  onApply: () => void;
};

function SampleDataBox({ onApply }: SampleDataBoxProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 shadow-lg min-w-[180px]">
      <div className="text-xs text-gray-400 mb-2 font-semibold">Sample Data</div>
      <table className="text-xs text-gray-300 mb-2 whitespace-nowrap">
        <tbody>
          <tr>
            <td className="pr-2">Current:</td>
            <td className="font-mono">{SAMPLE_DATA.current} A</td>
          </tr>
          <tr>
            <td className="pr-2">Length:</td>
            <td className="font-mono">{SAMPLE_DATA.length} m</td>
          </tr>
          <tr>
            <td className="pr-2">Resistivity:</td>
            <td className="font-mono">{SAMPLE_DATA.resistivity}</td>
          </tr>
          <tr>
            <td className="pr-2">Section:</td>
            <td className="font-mono">{SAMPLE_DATA.crossSection} mm²</td>
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

const Three = ({ cableEngine = null }: { cableEngine?: CableEngine | null }) => {
  const [current, setCurrent] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [resistivity, setResistivity] = useState<string>("");
  const [crossSection, setCrossSection] = useState<string>("");

  const [result, setResult] = useState<number | null>(null);

  const handleApplySample = () => {
    setCurrent(SAMPLE_DATA.current);
    setLength(SAMPLE_DATA.length);
    setResistivity(SAMPLE_DATA.resistivity);
    setCrossSection(SAMPLE_DATA.crossSection);
  };

  const handleCalculate = async () => {
    if (cableEngine) {
      const d = await cableEngine.voltageDropThree(
        parseNumber(current),
        parseNumber(length),
        parseNumber(resistivity),
        parseNumber(crossSection)
      );
      setResult(d);
    }
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1 min-w-[750px] bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl font-bold flex-1 text-white">Three-Phase Voltage Drop</h3>
          <ResultBox result={result} />
        </div>
        <FormFields
          current={current}
          length={length}
          resistivity={resistivity}
          crossSection={crossSection}
          onCurrentChange={setCurrent}
          onLengthChange={setLength}
          onResistivityChange={setResistivity}
          onCrossSectionChange={setCrossSection}
          onCalculate={handleCalculate}
        />
      </div>
      <SampleDataBox onApply={handleApplySample} />
    </div>
  );
};

export default Three;
