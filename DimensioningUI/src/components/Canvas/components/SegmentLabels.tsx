import { Fragment } from "react";
import { Text } from "react-konva";
import type { CableSegment } from "../types";
import { DEFAULTS } from "../../../lib/defaults";
import { parseNumber } from "../../../lib/numberInput";
import { getSortedSegmentIndices } from "../utils";

type SegmentLabelsProps = {
  segments: CableSegment[];
  scaleFactor: number;
  current: string;
  selectedSegmentIndices?: number[];
};

function getLabelPosition(
  segment: CableSegment,
  scaleFactor: number
): { x: number; y: number; align: "left" | "right" | "center"; verticalAlign: "top" | "bottom" } {
  if (segment.points.length < 2) {
    return { x: 0, y: 0, align: "center", verticalAlign: "top" };
  }

  const start = segment.points[0];
  const end = segment.points[segment.points.length - 1];
  
  // Calculate midpoint - always center labels on the segment
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  
  // Always position labels centered above and below the segment
  return {
    x: midX * scaleFactor,
    y: midY * scaleFactor - 20, // Above segment for cross-section label
    align: "center",
    verticalAlign: "bottom",
  };
}

const getTemperatureColor = (temperature: string): string => {
  switch (temperature) {
    case "Normal Indoor":
      return "#16a34a"; // Green
    case "Warm Space":
      return "#ca8a04"; // Yellow/Amber
    case "Hot Area":
      return "#dc2626"; // Red
    default:
      return "#16a34a"; // Default to green
  }
};

export function SegmentLabels({ 
  segments, 
  scaleFactor, 
  current,
  selectedSegmentIndices = []
}: SegmentLabelsProps) {
  const baseCurrent = parseNumber(current);
  const hasValidCurrent = !isNaN(baseCurrent) && baseCurrent > 0;
  
  // Sort segment indices: non-selected first, then selected (maintaining relative order)
  const sortedIndices = getSortedSegmentIndices(segments, selectedSegmentIndices);

  return (
    <>
      {sortedIndices.map((segIndex) => {
        const segment = segments[segIndex];
        const crossSection = segment.crossSection ?? DEFAULTS.CROSS_SECTION;
        const isCopper = segment.isCopper ?? DEFAULTS.IS_COPPER;
        const temperature = segment.temperature ?? DEFAULTS.TEMPERATURE;
        const { x, y, align, verticalAlign } = getLabelPosition(segment, scaleFactor);
        
        const labelText = `${crossSection.toFixed(2)} mm² ${isCopper ? "Cu" : "Al"}`;
        
        // Calculate derated current
        const deratingFactor = DEFAULTS.DERATING_FACTORS[temperature];
        const deratedCurrent = hasValidCurrent ? baseCurrent * deratingFactor : null;
        const deratedCurrentText = deratedCurrent !== null 
          ? `Derated Current: ${deratedCurrent.toFixed(2)} A` 
          : "Derated Current: — A";
        const temperatureColor = getTemperatureColor(temperature);
        
        // Offset for derated current label (below cross-section)
        // Cross-section is above segment (y - 20), so derated current goes below it
        // Increased offset to prevent label from touching the segment
        const offsetY = 25;
        
        return (
          <Fragment key={`segment-labels-${segIndex}`}>
            <Text
              x={x}
              y={y}
              text={labelText}
              fontSize={10}
              align={align}
              verticalAlign={verticalAlign}
              padding={4}
              fill="#00000080"
            />
            <Text
              x={x}
              y={y + offsetY}
              text={deratedCurrentText}
              fontSize={10}
              align={align}
              verticalAlign="top"
              padding={4}
              fill={temperatureColor}
            />
          </Fragment>
        );
      })}
    </>
  );
}
