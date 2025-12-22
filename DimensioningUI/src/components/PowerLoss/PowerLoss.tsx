import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";
import {
  Button,
  FormControl,
  Input,
  List,
  MetricCard,
  Section,
} from "@core/ui-headless";

const SAMPLE_DATA = {
  current: "16",
  length: "25",
  resistivity: "0.0175",
  crossSection: "2.5",
};

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
  cableEngine: CableEngine | null;
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
  cableEngine,
}: FormFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <FormControl label="Current (A)">
          <Input
            id="power-loss-current"
            name="power-loss-current"
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
        <FormControl label="Length (m)">
          <Input
            id="power-loss-length"
            name="power-loss-length"
            type="text"
            inputMode="decimal"
            value={length}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                onLengthChange(value);
              }
            }}
          />
        </FormControl>
        <FormControl label="Resistivity (Ω·mm²/m)">
          <Input
            id="power-loss-resistivity"
            name="power-loss-resistivity"
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
        <FormControl label="Cross-Section (mm²)">
          <Input
            id="power-loss-crossSection"
            name="power-loss-crossSection"
            type="text"
            inputMode="decimal"
            value={crossSection}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                onCrossSectionChange(value);
              }
            }}
          />
        </FormControl>
      </div>
      <Button
        className="w-full"
        variant="solid"
        color="primary"
        onClick={onCalculate}
        disabled={!cableEngine}
      >
        Calculate Power Loss
      </Button>
    </div>
  );
}

type SampleDataBoxProps = {
  onApply: () => void;
};

function SampleDataBox({ onApply }: SampleDataBoxProps) {
  return (
    <div className="bg-surface rounded-sm p-2 shadow-lg border border-section-border flex flex-col gap-2 w-24">
      <List
        headerText="Sample Data"
        options={[
          {
            variant: "text",
            label: "Current",
            value: `${SAMPLE_DATA.current} A`,
          },
          {
            variant: "text",
            label: "Length",
            value: `${SAMPLE_DATA.length} m`,
          },
          {
            variant: "text",
            label: "Resistivity",
            value: SAMPLE_DATA.resistivity,
          },
          {
            variant: "text",
            label: "Section",
            value: `${SAMPLE_DATA.crossSection} mm²`,
          },
        ]}
      />
      <Button
        className="w-full"
        variant="soft"
        color="primary"
        size="sm"
        onClick={onApply}
      >
        Apply
      </Button>
    </div>
  );
}

export default function PowerLoss({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) {
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
    if (!cableEngine) {
      alert("Cable engine not loaded");
      return;
    }

    try {
      const loss = await cableEngine.powerLoss(
        parseNumber(current),
        parseNumber(length),
        parseNumber(resistivity),
        parseNumber(crossSection)
      );
      setResult(loss);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Error calculating power loss");
    }
  };

  return (
    <Section title="Power Loss Calculation">
      <div className="flex gap-2 items-start p-2">
        <div className="flex flex-col gap-3 flex-1">
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
            cableEngine={cableEngine}
          />
          <MetricCard
            className="w-37.5"
            label=""
            value={result !== null && result >= 0 ? result.toFixed(2) : "—"}
            unit="W"
            badgeTitle="Power Loss"
          />
        </div>
        <SampleDataBox onApply={handleApplySample} />
      </div>
    </Section>
  );
}

