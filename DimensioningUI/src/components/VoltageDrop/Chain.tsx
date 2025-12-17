import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";

type Segment = {
  length: number;
  section: number;
};

type SegmentInputProps = {
  segment: Segment;
  index: number;
  canRemove: boolean;
  onChange: (index: number, field: keyof Segment, value: string) => void;
  onRemove: (index: number) => void;
};

function SegmentInput({
  segment,
  index,
  canRemove,
  onChange,
  onRemove,
}: SegmentInputProps) {
  return (
    <div className="flex gap-3 mb-3 items-end bg-gray-900 border border-gray-700 p-4 rounded-lg">
      <div className="flex flex-col flex-1 gap-2">
        <label htmlFor={`chain-segment-${index}-length`} className="text-gray-300 font-medium text-sm">Length in meters</label>
        <input
          id={`chain-segment-${index}-length`}
          name={`chain-segment-${index}-length`}
          className="bg-gray-800 border-2 border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none transition-colors"
          type="text"
          inputMode="decimal"
          value={segment.length.toString()}
          onChange={(e) => onChange(index, "length", e.target.value)}
        />
      </div>
      <div className="flex flex-col flex-1 gap-2">
        <label htmlFor={`chain-segment-${index}-section`} className="text-gray-300 font-medium text-sm">Cross Section in mm²</label>
        <input
          id={`chain-segment-${index}-section`}
          name={`chain-segment-${index}-section`}
          className="bg-gray-800 border-2 border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none transition-colors"
          type="text"
          inputMode="decimal"
          value={segment.section.toString()}
          onChange={(e) => onChange(index, "section", e.target.value)}
        />
      </div>
      {canRemove && (
        <button
          className="text-red-400 hover:text-red-300 font-bold text-xl pb-2 transition-colors"
          onClick={() => onRemove(index)}
        >
          ✕
        </button>
      )}
    </div>
  );
}

type SegmentsListProps = {
  segments: Segment[];
  onAdd: () => void;
  onChange: (index: number, field: keyof Segment, value: string) => void;
  onRemove: (index: number) => void;
};

function SegmentsList({
  segments,
  onAdd,
  onChange,
  onRemove,
}: SegmentsListProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-white text-lg">Segments</span>
        <button
          className="bg-green-600 hover:bg-green-500 active:bg-green-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors shadow-lg hover:shadow-xl"
          onClick={onAdd}
        >
          + Add Segment
        </button>
      </div>
      {segments.map((seg, index) => (
        <SegmentInput
          key={index}
          segment={seg}
          index={index}
          canRemove={segments.length > 1}
          onChange={onChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

const SAMPLE_DATA = {
  current: "16",
  resistivity: "0.0175",
  segments: [
    { length: 25, section: 2.5 },
    { length: 15, section: 4 },
  ],
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
  resistivity: string;
  segments: Segment[];
  onCurrentChange: (value: string) => void;
  onResistivityChange: (value: string) => void;
  onAddSegment: () => void;
  onChangeSegment: (index: number, field: keyof Segment, value: string) => void;
  onRemoveSegment: (index: number) => void;
  onCalculate: () => void;
};

function FormFields({
  current,
  resistivity,
  segments,
  onCurrentChange,
  onResistivityChange,
  onAddSegment,
  onChangeSegment,
  onRemoveSegment,
  onCalculate,
}: FormFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="chain-current" className="text-gray-300 font-medium">
            Current in A
          </label>
          <input
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
            type="text"
            inputMode="decimal"
            id="chain-current"
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
          <label htmlFor="chain-resistivity" className="text-gray-300 font-medium">
            Resistivity in ohm·mm²/m
          </label>
          <input
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
            type="text"
            inputMode="decimal"
            id="chain-resistivity"
            value={resistivity}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                onResistivityChange(value);
              }
            }}
          />
        </div>
      </div>
      <SegmentsList
        segments={segments}
        onAdd={onAddSegment}
        onChange={onChangeSegment}
        onRemove={onRemoveSegment}
      />
      <button
        className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg h-12 text-white font-semibold transition-colors shadow-lg hover:shadow-xl w-full"
        onClick={onCalculate}
      >
        Calculate
      </button>
    </div>
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
            <td className="pr-2">Resistivity:</td>
            <td className="font-mono">{SAMPLE_DATA.resistivity}</td>
          </tr>
          <tr>
            <td className="pr-2 align-top">Segments:</td>
            <td className="font-mono">
              {SAMPLE_DATA.segments.map((s, i) => (
                <div key={i} className="whitespace-nowrap">
                  {s.length}m / {s.section}mm²
                </div>
              ))}
            </td>
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

const Chain = ({ cableEngine = null }: { cableEngine?: CableEngine | null }) => {
  const [current, setCurrent] = useState<string>("");
  const [resistivity, setResistivity] = useState<string>("");
  const [segments, setSegments] = useState<Segment[]>([
    { length: 0, section: 0 },
  ]);
  const [result, setResult] = useState<number | null>(null);

  const handleApplySample = () => {
    setCurrent(SAMPLE_DATA.current);
    setResistivity(SAMPLE_DATA.resistivity);
    setSegments(SAMPLE_DATA.segments.map((s) => ({ ...s })));
  };

  const handleAddSegment = () => {
    setSegments([...segments, { length: 0, section: 0 }]);
  };

  const handleRemoveSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const handleChangeSegment = (
    index: number,
    field: keyof Segment,
    value: string
  ) => {
    if (!isValidNumberInput(value)) return;
    const updated = [...segments];
    updated[index][field] = parseNumber(value);
    setSegments(updated);
  };

  const handleCalculate = async () => {
    if (!cableEngine || segments.length === 0) return;

    const lengths = new Float64Array(segments.map((s) => s.length));
    const sections = new Float64Array(segments.map((s) => s.section));

    const d = await cableEngine.voltageDropChain({
      currentA: parseNumber(current),
      resistivity: parseNumber(resistivity),
      lengths,
      sections,
      count: segments.length,
    });

    setResult(d);
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1 min-w-[750px] bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl font-bold flex-1 text-white">Voltage Drop Chain</h3>
          <ResultBox result={result} />
        </div>
        <FormFields
          current={current}
          resistivity={resistivity}
          segments={segments}
          onCurrentChange={setCurrent}
          onResistivityChange={setResistivity}
          onAddSegment={handleAddSegment}
          onChangeSegment={handleChangeSegment}
          onRemoveSegment={handleRemoveSegment}
          onCalculate={handleCalculate}
        />
      </div>
      <SampleDataBox onApply={handleApplySample} />
    </div>
  );
};

export default Chain;
