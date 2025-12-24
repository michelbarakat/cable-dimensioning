import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";
import {
  Button,
  Checkbox,
  FormControl,
  IconButton,
  Input,
  MetricCard,
  Section,
} from "@core/ui-headless";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Remove01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { SampleDataBox } from "../Canvas/SampleDataBox";

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
    <div className="flex gap-2  items-end bg-surface border border-section-border p-2 rounded-sm">
      <Input
        id={`chain-segment-${index}-length`}
        name={`chain-segment-${index}-length`}
        type="text"
        inputMode="decimal"
        value={segment.length.toString()}
        onChange={(e) => onChange(index, "length", e.target.value)}
        endDecorator={<span className="text-gray-500 text-xs">m</span>}
        className="flex-1"
      />
      <Input
        id={`chain-segment-${index}-section`}
        name={`chain-segment-${index}-section`}
        type="text"
        inputMode="decimal"
        value={segment.section.toString()}
        onChange={(e) => onChange(index, "section", e.target.value)}
        endDecorator={<span className="text-gray-500 text-xs">mm²</span>}
        className="flex-1"
      />

      {canRemove && (
        <IconButton
          variant="soft"
          color="danger"
          onClick={() => onRemove(index)}
          icon={<HugeiconsIcon icon={Remove01Icon} />}
        />
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
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center p-2">
        <span className="font-semibold text-white text-lg">Segments</span>
        <IconButton icon={<HugeiconsIcon icon={Add01Icon} />} onClick={onAdd} color="primary" variant="soft" />
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

type FormFieldsProps = {
  current: string;
  resistivity: string;
  segments: Segment[];
  isThreePhase: boolean;
  onCurrentChange: (value: string) => void;
  onResistivityChange: (value: string) => void;
  onIsThreePhaseChange: (value: boolean) => void;
  onAddSegment: () => void;
  onChangeSegment: (index: number, field: keyof Segment, value: string) => void;
  onRemoveSegment: (index: number) => void;
  onCalculate: () => void;
};

function FormFields({
  current,
  resistivity,
  segments,
  isThreePhase,
  onCurrentChange,
  onResistivityChange,
  onIsThreePhaseChange,
  onAddSegment,
  onChangeSegment,
  onRemoveSegment,
  onCalculate,
}: FormFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <FormControl label="Current in A">
          <Input
            id="chain-current"
            name="chain-current"
            type="text"
            inputMode="decimal"
            value={current}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                onCurrentChange(value);
              }
            }}
          />
        </FormControl>
        <FormControl label="Resistivity in ohm·mm²/m">
          <Input
            id="chain-resistivity"
            name="chain-resistivity"
            type="text"
            inputMode="decimal"
            value={resistivity}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                onResistivityChange(value);
              }
            }}
          />
        </FormControl>
        <FormControl>
          <Checkbox
            id="chain-three-phase"
            checked={isThreePhase}
            onCheckedChange={() => onIsThreePhaseChange(!isThreePhase)}
            label="Three Phase"
          />
        </FormControl>
      </div>
      <SegmentsList
        segments={segments}
        onAdd={onAddSegment}
        onChange={onChangeSegment}
        onRemove={onRemoveSegment}
      />
      <Button
        className="w-full"
        variant="solid"
        color="primary"
        onClick={onCalculate}
      >
        Calculate
      </Button>
    </div>
  );
}


const Chain = ({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) => {
  const [current, setCurrent] = useState<string>("");
  const [resistivity, setResistivity] = useState<string>("");
  const [isThreePhase, setIsThreePhase] = useState<boolean>(false);
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

    const currentValue = parseNumber(current);
    const resistivityValue = parseNumber(resistivity);

    try {
      if (isThreePhase) {
        // Three-phase: calculate each segment individually and sum
        let total = 0;
        for (const segment of segments) {
          const segmentDrop = await cableEngine.voltageDropThree(
            currentValue,
            segment.length,
            resistivityValue,
            segment.section
          );
          total += segmentDrop;
        }
        setResult(total);
      } else {
        // Single-phase: use chain calculation
        const lengths = new Float64Array(segments.map((s) => s.length));
        const sections = new Float64Array(segments.map((s) => s.section));

        const d = await cableEngine.voltageDropChain({
          currentA: currentValue,
          resistivity: resistivityValue,
          lengths,
          sections,
          count: segments.length,
        });

        setResult(d);
      }
    } catch (error) {
      console.error("Calculation error:", error);
      setResult(-1);
    }
  };

  return (
    <Section title="Voltage Drop Chain">
      <div className="flex gap-2 items-start p-2">
        <div className="flex flex-col gap-3 flex-1">
          <FormFields
            current={current}
            resistivity={resistivity}
            segments={segments}
            isThreePhase={isThreePhase}
            onCurrentChange={setCurrent}
            onResistivityChange={setResistivity}
            onIsThreePhaseChange={setIsThreePhase}
            onAddSegment={handleAddSegment}
            onChangeSegment={handleChangeSegment}
            onRemoveSegment={handleRemoveSegment}
            onCalculate={handleCalculate}
          />
          <MetricCard
            className="w-37.5"
            label=""
            value={result !== null && result >= 0 ? result.toFixed(6) : "—"}
            unit="Volts"
            badgeTitle="Voltage Drop"
          />
        </div>
        <SampleDataBox
          options={[
            {
              variant: "text",
              label: "Current",
              value: `${SAMPLE_DATA.current} A`,
            },
            {
              variant: "text",
              label: "Resistivity",
              value: SAMPLE_DATA.resistivity,
            },
            ...SAMPLE_DATA.segments.map((s, index) => ({
              variant: "text" as const,
              label: index === 0 ? "Segments" : "",
              value: `${s.length}m / ${s.section}mm²`,
            })),
          ]}
          onApply={handleApplySample}
        />
      </div>
    </Section>
  );
};

export default Chain;
