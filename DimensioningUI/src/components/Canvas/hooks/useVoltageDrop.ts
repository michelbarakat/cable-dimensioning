import { useCallback, useEffect, useState } from "react";
import type { CableEngine } from "../../../lib/cable_dimensioning";
import { parseNumber } from "../../../lib/numberInput";
import type { CableSegment, Point } from "../types";
import { calculateSegmentLength } from "../utils";
import { DEFAULTS } from "../../../lib/defaults";

const isPositive = (value: number): boolean => {
  return value > 0;
};

const hasInvalidValues = (current: number, resistivity: number, scale: number): boolean => {
  const isCurrentValid = isPositive(current);
  const isResistivityValid = isPositive(resistivity);
  const isScaleValid = isPositive(scale);
  return !isCurrentValid || !isResistivityValid || !isScaleValid;
};

export function useVoltageDrop(
  cableEngine: CableEngine | null,
  segments: CableSegment[],
  currentSegment: Point[],
  current: string,
  resistivity: string,
  scale: string,
  isThreePhase: boolean = false
) {
  const [result, setResult] = useState<number | null>(null);

  const calculateVoltageDrop = useCallback(async () => {
    if (!cableEngine) {
      return null;
    }

    const currentValue = parseNumber(current);
    const resistivityValue = parseNumber(resistivity);
    const scaleValue = parseNumber(scale);

    if (hasInvalidValues(currentValue, resistivityValue, scaleValue)) {
      return null;
    }

    // Include current segment if it has enough points
    const allSegments = [...segments];
    if (currentSegment.length >= 2) {
      const currentLength = calculateSegmentLength(
        currentSegment,
        scaleValue
      );
      if (currentLength > 0) {
        allSegments.push({ 
          points: currentSegment, 
          length: currentLength,
          crossSection: DEFAULTS.CROSS_SECTION,
          isCopper: DEFAULTS.IS_COPPER,
        });
      }
    }

    if (allSegments.length === 0) {
      return null;
    }

    // Calculate total voltage drop using chain calculation
    const lengths = allSegments.map((seg) => seg.length);

    // Get cross-section values for each segment (use segment property or default)
    const sections = allSegments.map((seg) => {
      return seg.crossSection ?? DEFAULTS.CROSS_SECTION;
    });

    const lengthsArray = new Float64Array(lengths);
    const sectionsArray = new Float64Array(sections);

    try {
      if (isThreePhase) {
        // Three-phase: calculate each segment individually and sum
        let total = 0;
        for (let i = 0; i < allSegments.length; i++) {
          const segmentDrop = await cableEngine.voltageDropThree(
            currentValue,
            lengths[i],
            resistivityValue,
            sections[i]
          );
          total += segmentDrop;
        }
        return total;
      } else {
        // Single-phase: use chain calculation
        const voltageDrop = await cableEngine.voltageDropChain({
          currentA: currentValue,
          resistivity: resistivityValue,
          lengths: lengthsArray,
          sections: sectionsArray,
          count: allSegments.length,
        });
        return voltageDrop;
      }
    } catch (error) {
      console.error("Calculation error:", error);
      return -1;
    }
  }, [
    cableEngine,
    segments,
    currentSegment,
    current,
    resistivity,
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

