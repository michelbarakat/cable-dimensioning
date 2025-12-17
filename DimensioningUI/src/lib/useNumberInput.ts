import React, { useState, useCallback } from "react";
import { isValidNumberInput, parseNumber } from "./numberInput";

/**
 * Hook for managing number input state with locale-independent decimal support
 * @param initialValue - Initial numeric value
 * @returns [stringValue, setStringValue, numericValue, onChangeHandler] tuple
 */
export function useNumberInput(initialValue: number = 0) {
  const [stringValue, setStringValue] = useState<string>(
    initialValue.toString()
  );

  const setValue = useCallback((value: string) => {
    if (isValidNumberInput(value)) {
      setStringValue(value);
    }
  }, []);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    [setValue]
  );

  const numericValue = parseNumber(stringValue);

  return [stringValue, setValue, numericValue, onChange] as const;
}

