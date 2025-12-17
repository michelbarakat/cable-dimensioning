import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";

const SAMPLE_DATA = {
  temperature: "20",
  isCopper: true,
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
          <span className="text-xl font-semibold">{result.toFixed(6)} Ω·mm²/m</span>
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
    <div
      className={`h-[56px] flex items-center p-3 rounded-lg border whitespace-nowrap ${getBoxClasses()}`}
    >
      {renderContent()}
    </div>
  );
}

const Resistivity = ({ cableEngine = null }: { cableEngine?: CableEngine | null }) => {
  const [result, setResult] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<string>("");
  const [isCopper, setIsCopper] = useState(false);

  const handleApplySample = () => {
    setTemperature(SAMPLE_DATA.temperature);
    setIsCopper(SAMPLE_DATA.isCopper);
  };

  const handleCalculate = async () => {
    if (cableEngine) {
      const tempValue = parseNumber(temperature);
      const d = await cableEngine.getResistivity(isCopper ? 1 : 0, tempValue);
      setResult(d);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex gap-4 items-start">
        <div className="flex-1 bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold flex-1 text-white">Resistivity Calculation</h2>
            <ResultBox result={result} />
          </div>
        {!cableEngine && (
          <div className="mb-4 p-3 bg-yellow-900/30 rounded-lg border border-yellow-700">
            <p className="text-yellow-300 text-sm">
              ⚠️ WebAssembly module is still loading. Please wait...
            </p>
          </div>
        )}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="temperature" className="text-gray-300 font-medium">
              Temperature in °C
            </label>
            <input
              className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
              type="text"
              inputMode="decimal"
              id="temperature"
              value={temperature}
              onChange={(e) => {
                const value = e.target.value;
                if (isValidNumberInput(value)) {
                  setTemperature(value);
                }
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="copper"
              checked={isCopper}
              onChange={(e) => setIsCopper(e.target.checked)}
              className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="copper" className="text-gray-300 font-medium cursor-pointer">
              Is copper?
            </label>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg h-12 cursor-pointer text-white font-semibold transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCalculate}
            disabled={!cableEngine}
          >
            {cableEngine ? "Calculate" : "Loading..."}
          </button>
        </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 shadow-lg">
          <div className="text-xs text-gray-400 mb-2 font-semibold">Sample Data</div>
          <table className="text-xs text-gray-300 mb-2">
            <tbody>
              <tr>
                <td className="pr-2">Temp:</td>
                <td className="font-mono">{SAMPLE_DATA.temperature}°C</td>
              </tr>
              <tr>
                <td className="pr-2">Copper:</td>
                <td className="font-mono">{SAMPLE_DATA.isCopper ? "Yes" : "No"}</td>
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
    </div>
  );
};

export default Resistivity;
