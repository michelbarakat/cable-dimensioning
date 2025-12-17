import { SAMPLE_DATA } from "./constants";

type SampleDataBoxProps = {
  onApply: () => void;
};

export function SampleDataBox({ onApply }: SampleDataBoxProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 shadow-lg min-w-[180px]">
      <div className="text-xs text-gray-400 mb-2 font-semibold">
        Sample Data
      </div>
      <table className="text-xs text-gray-300 mb-2 whitespace-nowrap">
        <tbody>
          <tr>
            <td className="pr-2">Current:</td>
            <td className="font-mono">{SAMPLE_DATA.current} A</td>
          </tr>
          <tr>
            <td className="pr-2">Resistivity:</td>
            <td className="font-mono">{SAMPLE_DATA.resistivity}</td>
          </tr>
          <tr>
            <td className="pr-2">Section:</td>
            <td className="font-mono">{SAMPLE_DATA.crossSection} mm²</td>
          </tr>
          <tr>
            <td className="pr-2">Scale:</td>
            <td className="font-mono">{SAMPLE_DATA.scale} px/m</td>
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

