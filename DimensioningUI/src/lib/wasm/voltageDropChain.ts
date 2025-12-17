// Voltage drop chain calculation utilities

import { getStackFunctions, hasStackFunctions, getHEAPF64 } from "./memoryUtils";

type VoltageDropChainParams = {
  currentA: number;
  resistivity: number;
  lengths: Float64Array;
  sections: Float64Array;
  count: number;
};

// Helper to execute voltage drop chain calculation with stack allocation
export function executeVoltageDropChain(
  cwrap: (ident: string, returnType: string, argTypes: string[]) => (...args: any[]) => any,
  stackFuncs: ReturnType<typeof getStackFunctions>,
  HEAPF64: Float64Array,
  params: VoltageDropChainParams
): number {
  const { currentA, resistivity, lengths, sections, count } = params;
  const stackPtr = stackFuncs.stackGetCurrent();

  try {
    const lengthsBytes = count * 8;
    const sectionsBytes = count * 8;
    const lengthsPtr = stackFuncs.stackAlloc(lengthsBytes);
    const sectionsPtr = stackFuncs.stackAlloc(sectionsBytes);

    if (!lengthsPtr || !sectionsPtr) {
      throw new Error("Failed to allocate stack memory");
    }

    const lengthsOffset = lengthsPtr / 8;
    const sectionsOffset = sectionsPtr / 8;
    HEAPF64.set(lengths, lengthsOffset);
    HEAPF64.set(sections, sectionsOffset);

    const voltageDropChainFunc = cwrap("voltage_drop_chain", "number", [
      "number",
      "number",
      "number",
      "number",
      "number",
    ]);

    const result = voltageDropChainFunc(
      currentA,
      resistivity,
      lengthsPtr,
      sectionsPtr,
      count
    );

    return result;
  } finally {
    stackFuncs.stackRestore(stackPtr);
  }
}

// Helper to handle fallback when stack functions aren't available
export function voltageDropChainFallback(
  Module: any,
  voltageDropSingle: (...args: any[]) => number,
  params: VoltageDropChainParams
): number {
  const { currentA, resistivity, lengths, sections, count } = params;
  const lengthsArray = Array.from(lengths);
  const sectionsArray = Array.from(sections);
  const result = Module.ccall(
    "voltage_drop_chain",
    "number",
    ["number", "number", "array", "array", "number"],
    [currentA, resistivity, lengthsArray, sectionsArray, count]
  );

  if (result === -1 || result < 0) {
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += voltageDropSingle(currentA, lengths[i], resistivity, sections[i]);
    }
    return total;
  }

  return result;
}

