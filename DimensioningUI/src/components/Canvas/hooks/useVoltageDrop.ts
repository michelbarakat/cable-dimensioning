import { useCallback, useEffect, useState } from "react";
import type { CableEngine } from "../../../lib/cable_dimensioning";
import { parseNumber } from "../../../lib/numberInput";
import type { CableSegment, Point } from "../types";
import { calculateSegmentLength } from "../utils";
import { DEFAULTS } from "../../../lib/defaults";

type ParsedValues = {
  currentValue: number;
  resistivityValue: number;
  scaleValue: number;
};

const isPositive = (value: number): boolean => {
  return value > 0;
};

const hasInvalidValues = (currentValue: number, scaleValue: number): boolean => {
  const isCurrentValid = isPositive(currentValue);
  const isScaleValid = isPositive(scaleValue);
  return !isCurrentValid || !isScaleValid;
};

type UseVoltageDropParams = {
  cableEngine: CableEngine | null;
  segments: CableSegment[];
  currentSegment: Point[];
  current: string;
  scale: string;
  isThreePhase?: boolean;
};

const prepareAllSegments = (
  segments: CableSegment[],
  currentSegment: Point[],
  parsedValues: { scaleValue: number }
): CableSegment[] => {
  const allSegments = [...segments];
  if (currentSegment.length >= 2) {
    const currentLength = calculateSegmentLength(currentSegment, parsedValues.scaleValue);
    if (currentLength > 0) {
      allSegments.push({
        points: currentSegment,
        length: currentLength,
        crossSection: DEFAULTS.CROSS_SECTION,
        isCopper: DEFAULTS.IS_COPPER,
        temperature: DEFAULTS.TEMPERATURE,
      });
    }
  }
  return allSegments;
};

const calculateThreePhaseVoltageDrop = async (
  cableEngine: CableEngine,
  allSegments: CableSegment[],
  baseCurrentValue: number
): Promise<number> => {
  let total = 0;
  for (const segment of allSegments) {
    const length = segment.length;
    const section = segment.crossSection ?? DEFAULTS.CROSS_SECTION;
    const resistivityValue = getResistivityForSegment(segment);
    const deratedCurrent = await calculateDeratedCurrent(cableEngine, baseCurrentValue, segment);
    const segmentDrop = await cableEngine.voltageDropThree(
      deratedCurrent,
      length,
      resistivityValue,
      section
    );
    total += segmentDrop;
  }
  return total;
};

const calculateSinglePhaseVoltageDrop = async (
  cableEngine: CableEngine,
  allSegments: CableSegment[],
  baseCurrentValue: number
): Promise<number> => {
  // For single-phase chain calculation, we need a single resistivity value
  // Use the first segment's resistivity (or calculate average if needed)
  // Since voltageDropChain expects a single resistivity, we'll use the first segment's
  const firstSegment = allSegments[0];
  const resistivityValue = getResistivityForSegment(firstSegment);
  
  // For chain calculation, we need to use derated current
  // Use the first segment's temperature for derating (or calculate weighted average if needed)
  const deratedCurrent = await calculateDeratedCurrent(cableEngine, baseCurrentValue, firstSegment);
  
  const lengths = allSegments.map((seg) => seg.length);
  const sections = allSegments.map((seg) => seg.crossSection ?? DEFAULTS.CROSS_SECTION);
  const lengthsArray = new Float64Array(lengths);
  const sectionsArray = new Float64Array(sections);

  return await cableEngine.voltageDropChain({
    currentA: deratedCurrent,
    resistivity: resistivityValue,
    lengths: lengthsArray,
    sections: sectionsArray,
    count: allSegments.length,
  });
};

const parseInputValues = (
  current: string,
  scale: string
): Omit<ParsedValues, "resistivityValue"> & { scaleValue: number } => {
  return {
    currentValue: parseNumber(current),
    scaleValue: parseNumber(scale),
  };
};

const getResistivityForSegment = (segment: CableSegment): number => {
  // Use reference resistivity at 20°C based on material only
  const isCopper = segment.isCopper ?? DEFAULTS.IS_COPPER;
  return isCopper ? DEFAULTS.RESISTIVITY_COPPER : DEFAULTS.RESISTIVITY_ALUMINUM;
};

const calculateDeratedCurrent = async (
  cableEngine: CableEngine,
  baseCurrent: number,
  segment: CableSegment
): Promise<number> => {
  const temperature = segment.temperature ?? DEFAULTS.TEMPERATURE;
  const deratingFactor = DEFAULTS.DERATING_FACTORS[temperature];
  // applyDerating(baseCurrent, kTemp, kGroup) - we only use temperature derating, so kGroup = 1
  return await cableEngine.applyDerating(baseCurrent, deratingFactor, 1);
};

const executeVoltageDropCalculation = async (
  cableEngine: CableEngine,
  allSegments: CableSegment[],
  currentValue: number,
  isThreePhase: boolean
): Promise<number> => {
  if (isThreePhase) {
    return await calculateThreePhaseVoltageDrop(cableEngine, allSegments, currentValue);
  }
  return await calculateSinglePhaseVoltageDrop(cableEngine, allSegments, currentValue);
};

export function useVoltageDrop({
  cableEngine,
  segments,
  currentSegment,
  current,
  scale,
  isThreePhase = false,
}: UseVoltageDropParams) {
  const [result, setResult] = useState<number | null>(null);

  const calculateVoltageDrop = useCallback(async () => {
    if (!cableEngine) return null;

    const parsedValues = parseInputValues(current, scale);
    const currentValue = parsedValues.currentValue;
    const scaleValue = parsedValues.scaleValue;

    if (hasInvalidValues(currentValue, scaleValue)) {
      return null;
    }

    const allSegments = prepareAllSegments(segments, currentSegment, { scaleValue });
    if (allSegments.length === 0) return null;

    try {
      return await executeVoltageDropCalculation(
        cableEngine,
        allSegments,
        currentValue,
        isThreePhase
      );
    } catch (error) {
      console.error("Calculation error:", error);
      return -1;
    }
  }, [
    cableEngine,
    segments,
    currentSegment,
    current,
    scale,
    isThreePhase,
  ]);

  useEffect(() => {
    calculateVoltageDrop().then(setResult).catch((error) => {
      console.error("Calculation error:", error);
      setResult(null);
    });
  }, [calculateVoltageDrop]);

  return result;
}

