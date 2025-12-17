import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";

const SAMPLE_DATA = {
  current: "16",
  length: "25",
  resistivity: "0.0175",
  maxVoltageDrop: "3",
};

export default function Single({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) {
  const [current, setCurrent] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [resistivity, setResistivity] = useState<string>("");
  const [maxVoltageDrop, setMaxVoltageDrop] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);

  const handleApplySample = () => {
    setCurrent(SAMPLE_DATA.current);
    setLength(SAMPLE_DATA.length);
    setResistivity(SAMPLE_DATA.resistivity);
    setMaxVoltageDrop(SAMPLE_DATA.maxVoltageDrop);
  };

  const handleCalculate = async () => {
    if (!cableEngine) {
      alert("Cable engine not loaded");
      return;
    }

    try {
      const crossSection = await cableEngine.crossSectionSingle(
        parseNumber(current),
        parseNumber(length),
        parseNumber(resistivity),
        parseNumber(maxVoltageDrop)
      );
      setResult(crossSection);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Error calculating cross-section");
    }
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1 bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-2xl font-bold flex-1 text-white">Single-Phase Cross-Section</h3>
        <div
          className={`h-[56px] flex items-center p-3 rounded-lg border whitespace-nowrap ${
            result === null
              ? "bg-gray-900/50 border-gray-700"
              : result !== null && result >= 0
                ? "bg-gray-900 border-gray-700"
                : "bg-red-900/30 border-red-700"
          }`}
        >
          {result === null ? (
            <p className="text-gray-500 text-sm">
              <strong className="text-gray-400">Result: </strong>—
            </p>
          ) : result >= 0 ? (
            <p className="text-white">
              <strong className="text-blue-400">Result: </strong>
              <span className="text-xl font-semibold">{result.toFixed(2)} mm²</span>
            </p>
          ) : (
            <p className="text-red-300">
              <strong>Error: </strong>Invalid input
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="cross-section-single-current" className="text-gray-300 font-medium">
            Current (A)
          </label>
          <input
            id="cross-section-single-current"
            name="cross-section-single-current"
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
          <label htmlFor="cross-section-single-length" className="text-gray-300 font-medium">
            Length (m)
          </label>
          <input
            id="cross-section-single-length"
            name="cross-section-single-length"
            type="text"
            inputMode="decimal"
            value={length}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                setLength(value);
              }
            }}
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="cross-section-single-resistivity" className="text-gray-300 font-medium">
            Resistivity (Ω·mm²/m)
          </label>
          <input
            id="cross-section-single-resistivity"
            name="cross-section-single-resistivity"
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
        <div className="flex flex-col gap-2">
          <label htmlFor="cross-section-single-maxVoltageDrop" className="text-gray-300 font-medium">
            Max Voltage Drop (V)
          </label>
          <input
            id="cross-section-single-maxVoltageDrop"
            name="cross-section-single-maxVoltageDrop"
            type="text"
            inputMode="decimal"
            value={maxVoltageDrop}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                setMaxVoltageDrop(value);
              }
            }}
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
      </div>
        <button
          onClick={handleCalculate}
          className="mt-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg h-12 cursor-pointer text-white font-semibold transition-colors shadow-lg hover:shadow-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!cableEngine}
        >
          Calculate Cross-Section
        </button>
      </div>
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 shadow-lg">
        <div className="text-xs text-gray-400 mb-2 font-semibold">Sample Data</div>
        <table className="text-xs text-gray-300 mb-2">
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
              <td className="pr-2">Max ΔV:</td>
              <td className="font-mono">{SAMPLE_DATA.maxVoltageDrop} V</td>
            </tr>
          </tbody>
        </table>
        <button
          onClick={handleApplySample}
          className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1.5 rounded transition-colors cursor-pointer"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

