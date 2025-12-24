import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";
import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  Input,
  MetricCard,
  Section,
} from "@core/ui-headless";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserWarning02Icon } from "@hugeicons-pro/core-stroke-rounded";
import { SampleDataBox } from "../Canvas/SampleDataBox";

const SAMPLE_DATA = {
  temperature: "20",
  isCopper: true,
};

const Resistivity = ({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) => {
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
    <Section title="Resistivity Calculation">
      <div className="flex gap-2 items-start p-2">
        <div className="flex flex-col gap-3 flex-1">
          {!cableEngine && (
            <Alert
              variant="soft"
              color="warning"
              title="Warning"
              icon={<HugeiconsIcon icon={UserWarning02Icon} />}
            >
              WebAssembly module is still loading. Please wait...
            </Alert>
          )}
          <FormControl label="Temperature in °C">
            <Input
              id="temperature"
              name="temperature"
              type="text"
              inputMode="decimal"
              value={temperature}
              onChange={(e) => {
                const value = e.target.value;
                if (isValidNumberInput(value)) {
                  setTemperature(value);
                }
              }}
            />
          </FormControl>
          <FormControl>
            <Checkbox
              id="copper"
              defaultChecked={isCopper}
              checked={isCopper}
              onCheckedChange={() => setIsCopper((prev) => !prev)}
              label="Is copper?"
            />
          </FormControl>
          <Button
            className="w-full"
            variant="solid"
            color="primary"
            onClick={handleCalculate}
          >
            {cableEngine ? "Calculate" : "Loading..."}
          </Button>

          <MetricCard
            className="w-37.5"
            label=""
            value={result?.toFixed(6) ?? "—"}
            unit="Ω·mm²/m"
            badgeTitle="Resistivity"
          />
        </div>
        <SampleDataBox
          options={[
            {
              variant: "text",
              label: "Temperature",
              value: `${SAMPLE_DATA.temperature}°C`,
            },
            {
              variant: "text",
              label: "Copper",
              value: "yes",
            },
          ]}
          onApply={handleApplySample}
        />
      </div>
    </Section>
  );
};

export default Resistivity;
