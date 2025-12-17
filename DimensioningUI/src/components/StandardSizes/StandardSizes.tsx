import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";

const SAMPLE_DATA = {
  crossSection: "3.2",
};

export default function StandardSizes({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) {
  const [crossSection, setCrossSection] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);

  const handleApplySample = () => {
    setCrossSection(SAMPLE_DATA.crossSection);
  };

  const handleCalculate = async () => {
    if (!cableEngine) {
      alert("Cable engine not loaded");
      return;
    }

    try {
      const standardSize = await cableEngine.roundToStandard(parseNumber(crossSection));
      setResult(standardSize);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Error rounding to standard size");
    }
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1 bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold flex-1 text-white">Round to Standard Size</h2>
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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="standard-sizes-crossSection" className="text-gray-300 font-medium">
            Calculated Cross-Section (mm²)
          </label>
          <input
            id="standard-sizes-crossSection"
            name="standard-sizes-crossSection"
            type="text"
            inputMode="decimal"
            value={crossSection}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                setCrossSection(value);
              }
            }}
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={handleCalculate}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg h-12 cursor-pointer text-white font-semibold transition-colors shadow-lg hover:shadow-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!cableEngine}
        >
          Round to Standard
        </button>
      </div>
      </div>
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 shadow-lg">
        <div className="text-xs text-gray-400 mb-2 font-semibold">Sample Data</div>
        <table className="text-xs text-gray-300 mb-2">
          <tbody>
            <tr>
              <td className="pr-2">Section:</td>
              <td className="font-mono">{SAMPLE_DATA.crossSection} mm²</td>
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

