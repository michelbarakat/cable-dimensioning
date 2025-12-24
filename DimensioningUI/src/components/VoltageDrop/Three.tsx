import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";
import {
  Button,
  FormControl,
  Input,
  MetricCard,
  Section,
} from "@core/ui-headless";
import { SampleDataBox } from "../Canvas/SampleDataBox";

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
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <FormControl label="Current in A">
          <Input
            id="three-current"
            name="three-current"
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
        <FormControl label="Length in meters">
          <Input
            id="three-length"
            name="three-length"
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
        <FormControl label="Resistivity in ohm·mm²/m">
          <Input
            id="three-resistivity"
            name="three-resistivity"
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
        <FormControl label="Cross Section in mm²">
          <Input
            id="three-crossSection"
            name="three-crossSection"
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
      >
        Calculate
      </Button>
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
    <Section title="Three-Phase Voltage Drop">
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
          onApply={handleApplySample}
        />
      </div>
    </Section>
  );
};

export default Three;
