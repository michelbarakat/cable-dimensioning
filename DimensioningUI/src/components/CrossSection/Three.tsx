import { useState, useEffect } from "react";
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
  maxVoltageDrop: "3",
};

type FormFieldsProps = {
  current: string;
  length: string;
  resistivity: string;
  maxVoltageDrop: string;
  onCurrentChange: (value: string) => void;
  onLengthChange: (value: string) => void;
  onResistivityChange: (value: string) => void;
  onMaxVoltageDropChange: (value: string) => void;
  onCalculate: () => void;
  cableEngine: CableEngine | null;
};

function FormFields({
  current,
  length,
  resistivity,
  maxVoltageDrop,
  onCurrentChange,
  onLengthChange,
  onResistivityChange,
  onMaxVoltageDropChange,
  onCalculate,
  cableEngine,
}: FormFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <FormControl label="Current (A)">
          <Input
            id="cross-section-three-current"
            name="cross-section-three-current"
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
            id="cross-section-three-length"
            name="cross-section-three-length"
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
            id="cross-section-three-resistivity"
            name="cross-section-three-resistivity"
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
        <FormControl label="Max Voltage Drop (V)">
          <Input
            id="cross-section-three-maxVoltageDrop"
            name="cross-section-three-maxVoltageDrop"
            type="text"
            inputMode="decimal"
            value={maxVoltageDrop}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidNumberInput(value)) {
                onMaxVoltageDropChange(value);
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
        Calculate Cross-Section
      </Button>
    </div>
  );
}


export default function Three({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) {
  const [current, setCurrent] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [resistivity, setResistivity] = useState<string>("");
  const [maxVoltageDrop, setMaxVoltageDrop] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const [roundedResult, setRoundedResult] = useState<number | null>(null);

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
      const crossSection = await cableEngine.crossSectionThree(
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

  // Calculate rounded value whenever result changes
  useEffect(() => {
    const calculateRounded = async () => {
      if (!cableEngine) {
        setRoundedResult(null);
        return;
      }
      
      if (result === null || result < 0) {
        setRoundedResult(null);
        return;
      }

      try {
        const rounded = await cableEngine.roundToStandard(result);
        setRoundedResult(rounded);
      } catch (error) {
        console.error("Error rounding to standard:", error);
        setRoundedResult(null);
      }
    };

    calculateRounded();
  }, [result, cableEngine]);

  return (
    <Section title="Three-Phase Cross-Section">
      <div className="flex gap-2 items-start p-2">
        <div className="flex flex-col gap-3 flex-1">
          <FormFields
            current={current}
            length={length}
            resistivity={resistivity}
            maxVoltageDrop={maxVoltageDrop}
            onCurrentChange={setCurrent}
            onLengthChange={setLength}
            onResistivityChange={setResistivity}
            onMaxVoltageDropChange={setMaxVoltageDrop}
            onCalculate={handleCalculate}
            cableEngine={cableEngine}
          />
          <MetricCard
            className="w-37.5"
            label=""
            value={result !== null && result >= 0 ? result.toFixed(2) : "—"}
            unit="mm²"
            badgeTitle="Cross-Section"
          />
          <MetricCard
            className="w-37.5"
            label=""
            value={roundedResult !== null && roundedResult >= 0 ? roundedResult.toFixed(2) : "—"}
            unit="mm²"
            badgeTitle="Cross-Section Rounded to Standard"
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
              label: "Max ΔV",
              value: `${SAMPLE_DATA.maxVoltageDrop} V`,
            },
          ]}
          onApply={handleApplySample}
        />
      </div>
    </Section>
  );
}

