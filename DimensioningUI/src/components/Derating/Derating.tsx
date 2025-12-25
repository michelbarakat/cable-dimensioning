import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";
import { DEFAULTS } from "../../lib/defaults";
import type { TemperaturePreset } from "../Canvas/types";
import { TEMPERATURE_PRESETS } from "../Canvas/types";
import {
  Button,
  FormControl,
  Input,
  MetricCard,
  Section,
  Select,
  Typography,
} from "@core/ui-headless";
import { SampleDataBox } from "../Canvas/SampleDataBox";

const SAMPLE_DATA = {
  current: DEFAULTS.CURRENT,
  temperature: DEFAULTS.TEMPERATURE,
};

type FormFieldsProps = {
  current: string;
  temperature: TemperaturePreset;
  deratingFactor: number;
  onCurrentChange: (value: string) => void;
  onTemperatureChange: (value: TemperaturePreset) => void;
  onCalculate: () => void;
  cableEngine: CableEngine | null;
};

function FormFields({
  current,
  temperature,
  deratingFactor,
  onCurrentChange,
  onTemperatureChange,
  onCalculate,
  cableEngine,
}: FormFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <FormControl label="Nominal Current (A)">
          <Input
            id="derating-current"
            name="derating-current"
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
        <FormControl label="Temperature Preset">
          <Select
            name="derating-temperature"
            value={temperature}
            onValueChange={(value) =>
              onTemperatureChange(value as TemperaturePreset)
            }
            options={Object.keys(TEMPERATURE_PRESETS).map((preset) => ({
              label: `${preset} (~${TEMPERATURE_PRESETS[preset as TemperaturePreset]}°C)`,
              value: preset,
            }))}
          />
        </FormControl>
        <FormControl label="Derating Factor (read-only)">
          <Input
            id="derating-factor"
            name="derating-factor"
            type="text"
            value={deratingFactor.toFixed(2)}
            readOnly
            disabled
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
        Apply Derating
      </Button>
    </div>
  );
}


export default function Derating({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) {
  const [current, setCurrent] = useState<string>("");
  const [temperature, setTemperature] = useState<TemperaturePreset>(
    DEFAULTS.TEMPERATURE
  );
  const [result, setResult] = useState<number | null>(null);

  // Derating factor is automatically derived from temperature preset
  const deratingFactor = DEFAULTS.DERATING_FACTORS[temperature];

  const handleApplySample = () => {
    setCurrent(SAMPLE_DATA.current);
  };

  const handleCalculate = async () => {
    if (!cableEngine) {
      alert("Cable engine not loaded");
      return;
    }

    const currentValue = parseNumber(current);
    if (isNaN(currentValue) || currentValue <= 0) {
      alert("Please enter a valid current value");
      return;
    }

    try {
      // applyDerating(baseCurrent, kTemp, kGroup)
      // kTemp is the temperature derating factor
      // kGroup is set to 1 (no group derating)
      const deratedCurrent = await cableEngine.applyDerating(
        currentValue,
        deratingFactor,
        1
      );
      setResult(deratedCurrent);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Error applying derating");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Typography level="h1" className="text-center">
        CURRENT DERATING
      </Typography>
      <Section title="Current Derating">
        <div className="flex gap-2 items-start p-2">
          <div className="flex flex-col gap-3 flex-1">
            <FormFields
              current={current}
              temperature={temperature}
              deratingFactor={deratingFactor}
              onCurrentChange={setCurrent}
              onTemperatureChange={setTemperature}
              onCalculate={handleCalculate}
              cableEngine={cableEngine}
            />
            <MetricCard
              className="w-37.5"
              label=""
              value={result !== null && result >= 0 ? result.toFixed(2) : "—"}
              unit="A"
              badgeTitle="Derated Current"
            />
          </div>
          <SampleDataBox
            options={[
              {
                variant: "text",
                label: "Current",
                value: `${SAMPLE_DATA.current} A`,
              },
            ]}
            onApply={handleApplySample}
          />
        </div>
      </Section>
    </div>
  );
}
