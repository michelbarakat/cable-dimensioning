import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";

const SAMPLE_DATA = {
  current: "16",
  deratingFactor: "0.8",
  ambientTemp: "30",
};

export default function Derating({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) {
  const [current, setCurrent] = useState<string>("");
  const [deratingFactor, setDeratingFactor] = useState<string>("");
  const [ambientTemp, setAmbientTemp] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);

  const handleApplySample = () => {
    setCurrent(SAMPLE_DATA.current);
    setDeratingFactor(SAMPLE_DATA.deratingFactor);
    setAmbientTemp(SAMPLE_DATA.ambientTemp);
  };

  const handleCalculate = async () => {
    if (!cableEngine) {
      alert("Cable engine not loaded");
      return;
    }

    try {
      const deratedCurrent = await cableEngine.applyDerating(
        parseNumber(current),
        parseNumber(deratingFactor),
        parseNumber(ambientTemp)
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
              <span className="text-xl font-semibold">{result.toFixed(2)} A</span>
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
          <label htmlFor="derating-current" className="text-gray-300 font-medium">
            Nominal Current (A)
          </label>
          <input
            id="derating-current"
            name="derating-current"
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
          <label htmlFor="derating-factor" className="text-gray-300 font-medium">
            Derating Factor
          </label>
          <input
            id="derating-factor"
            name="derating-factor"
            type="text"
            inputMode="decimal"
            value={deratingFactor}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                setDeratingFactor(value);
              }
            }}
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="derating-ambientTemp" className="text-gray-300 font-medium">
            Ambient Temperature (°C)
          </label>
          <input
            id="derating-ambientTemp"
            name="derating-ambientTemp"
            type="text"
            inputMode="decimal"
            value={ambientTemp}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                setAmbientTemp(value);
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
          Apply Derating
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
              <td className="pr-2">Factor:</td>
              <td className="font-mono">{SAMPLE_DATA.deratingFactor}</td>
            </tr>
            <tr>
              <td className="pr-2">Temp:</td>
              <td className="font-mono">{SAMPLE_DATA.ambientTemp}°C</td>
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

