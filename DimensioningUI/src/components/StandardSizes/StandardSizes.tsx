import { useState } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";
import {
  Button,
  FormControl,
  Input,
  MetricCard,
  Section,
  Typography,
} from "@core/ui-headless";
import { SampleDataBox } from "../Canvas/SampleDataBox";

const SAMPLE_DATA = {
  crossSection: "3.2",
};

export default function StandardSizes({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) {
  const [crossSection, setCrossSection] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);

  const handleApplySample = () => {
    setCrossSection(SAMPLE_DATA.crossSection);
  };

  const handleCalculate = async () => {
    if (!cableEngine) {
      alert("Cable engine not loaded");
      return;
    }

    try {
      const standardSize = await cableEngine.roundToStandard(parseNumber(crossSection));
      setResult(standardSize);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Error rounding to standard size");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Typography level="h1" className="text-center">
        STANDARD SIZES
      </Typography>
      <Section title="Round to Standard Size">
        <div className="flex gap-2 items-start p-2">
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex flex-col gap-3">
              <FormControl label="Calculated Cross-Section (mm²)">
                <Input
                  id="standard-sizes-crossSection"
                  name="standard-sizes-crossSection"
                  type="text"
                  inputMode="decimal"
                  value={crossSection}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (isValidNumberInput(value)) {
                      setCrossSection(value);
                    }
                  }}
                />
              </FormControl>
              <Button
                className="w-full"
                variant="solid"
                color="primary"
                onClick={handleCalculate}
                disabled={!cableEngine}
              >
                Round to Standard
              </Button>
            </div>
            <MetricCard
              className="w-37.5"
              label=""
              value={result !== null && result >= 0 ? result.toFixed(2) : "—"}
              unit="mm²"
              badgeTitle="Standard Size"
            />
          </div>
          <SampleDataBox
            options={[
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
    </div>
  );
}

