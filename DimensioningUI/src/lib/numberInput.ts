// Utility functions for handling number inputs with locale-independent decimal separators

/**
 * Parses a number string accepting both dot and comma as decimal separator
 * @param value - String value to parse
 * @returns Parsed number, or 0 if invalid
 */
export function parseNumber(value: string): number {
  if (value === "" || value === "-" || value === "." || value === ",") {
    return 0;
  }
  // Replace comma with dot for parsing
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validates if a string is a valid number format (accepts both dot and comma)
 * @param value - String value to validate
 * @returns true if valid number format
 */
export function isValidNumberInput(value: string): boolean {
  // Allow empty string, minus sign, digits, one dot OR comma
  return value === "" || /^-?\d*[,.]?\d*$/.test(value);
}

/**
 * Handler for number input onChange events
 * Validates and updates the string value, returns the parsed number
 * @param value - New input value
 * @param setStringValue - State setter for string value
 * @returns Parsed numeric value
 */
export function handleNumberInputChange(
  value: string,
  setStringValue: (value: string) => void
): number {
  if (isValidNumberInput(value)) {
    setStringValue(value);
    return parseNumber(value);
  }
  return parseNumber(value); // Return current parsed value if invalid
}

