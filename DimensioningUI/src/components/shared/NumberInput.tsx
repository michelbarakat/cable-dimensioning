import React from "react";
import { isValidNumberInput, parseNumber } from "../../lib/numberInput";

type NumberInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value: number;
  onChange: (value: number) => void;
  /** Display value as string to allow both dot and comma */
  displayValue?: string;
  onDisplayChange?: (value: string) => void;
};

/**
 * Number input component that accepts both dot and comma as decimal separator
 * Works around browser locale issues with type="number"
 */
export default function NumberInput({
  value,
  onChange,
  displayValue,
  onDisplayChange,
  className = "",
  ...props
}: NumberInputProps) {
  const [localDisplayValue, setLocalDisplayValue] = React.useState<string>(
    displayValue ?? value.toString()
  );

  // Use controlled displayValue if provided, otherwise use local state
  const currentDisplayValue = displayValue ?? localDisplayValue;
  const setDisplayValue = onDisplayChange ?? setLocalDisplayValue;

  // Sync display value when numeric value changes externally
  React.useEffect(() => {
    if (displayValue === undefined) {
      setLocalDisplayValue(value.toString());
    }
  }, [value, displayValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isValidNumberInput(newValue)) {
      setDisplayValue(newValue);
      const parsed = parseNumber(newValue);
      onChange(parsed);
    }
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      className={className}
      value={currentDisplayValue}
      onChange={handleChange}
    />
  );
}

