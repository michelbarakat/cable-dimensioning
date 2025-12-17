import { useCallback, useEffect, useState } from "react";
import type { CableEngine } from "../../../lib/cable_dimensioning";
import { parseNumber } from "../../../lib/numberInput";
import type { CableSegment, Point } from "../types";
import { calculateSegmentLength } from "../utils";

export function useVoltageDrop(
  cableEngine: CableEngine | null,
  segments: CableSegment[],
  currentSegment: Point[],
  current: string,
  resistivity: string,
  crossSection: string,
  scale: string,
  crossSectionValues: Map<string, number>
) {
  const [result, setResult] = useState<number | null>(null);

  const calculateVoltageDrop = useCallback(async () => {
    if (!cableEngine) {
      return null;
    }

    const currentValue = parseNumber(current);
    const resistivityValue = parseNumber(resistivity);
    const crossSectionValue = parseNumber(crossSection);
    const scaleValue = parseNumber(scale);

    if (
      currentValue <= 0 ||
      resistivityValue <= 0 ||
      crossSectionValue <= 0 ||
      scaleValue <= 0
    ) {
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
        allSegments.push({ points: currentSegment, length: currentLength });
      }
    }

    if (allSegments.length === 0) {
      return null;
    }

    // Calculate total voltage drop using chain calculation
    const lengths = allSegments.map((seg) => seg.length);

    // Get cross-section values for each segment
    // For connected segments, use the cross-section value at the connection point
    const sections = allSegments.map((seg, index) => {
      // Check if this segment is connected to another segment
      if (seg.connectedTo !== undefined) {
        const connectedIndex = seg.connectedTo;
        // Create connection key (sorted to ensure consistency)
        const connectionKey = `${Math.min(index, connectedIndex)}-${Math.max(index, connectedIndex)}`;

        if (crossSectionValues.has(connectionKey)) {
          return crossSectionValues.get(connectionKey)!;
        }
      }
      // Fall back to segment-specific cross-section or default
      return seg.crossSection ?? crossSectionValue;
    });

    const lengthsArray = new Float64Array(lengths);
    const sectionsArray = new Float64Array(sections);

    try {
      const voltageDrop = await cableEngine.voltageDropChain({
        currentA: currentValue,
        resistivity: resistivityValue,
        lengths: lengthsArray,
        sections: sectionsArray,
        count: allSegments.length,
      });
      return voltageDrop;
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
    crossSection,
    scale,
    crossSectionValues,
  ]);

  useEffect(() => {
    calculateVoltageDrop().then(setResult).catch((error) => {
      console.error("Calculation error:", error);
      setResult(null);
    });
  }, [calculateVoltageDrop]);

  return result;
}

