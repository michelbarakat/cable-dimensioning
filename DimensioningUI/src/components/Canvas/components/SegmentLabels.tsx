import { Text } from "react-konva";
import type { CableSegment } from "../types";
import { DEFAULTS } from "../../../lib/defaults";

type SegmentLabelsProps = {
  segments: CableSegment[];
  scaleFactor: number;
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
  
  // Calculate midpoint
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  
  // Calculate angle
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);
  
  // Determine label position based on angle
  // For horizontal-ish segments (angle close to 0 or π), place label above/below
  // For vertical-ish segments (angle close to ±π/2), place label left/right
  const isHorizontal = Math.abs(Math.sin(angle)) < Math.abs(Math.cos(angle));
  
  if (isHorizontal) {
    // Place above or below based on which side has more space
    return {
      x: midX * scaleFactor,
      y: midY * scaleFactor - 20, // Above
      align: "center",
      verticalAlign: "bottom",
    };
  } else {
    // Place to the left or right
    return {
      x: midX * scaleFactor + 20, // Right
      y: midY * scaleFactor,
      align: "left",
      verticalAlign: "top",
    };
  }
}

export function SegmentLabels({ segments, scaleFactor }: SegmentLabelsProps) {
  return (
    <>
      {segments.map((segment, segIndex) => {
        const crossSection = segment.crossSection ?? DEFAULTS.CROSS_SECTION;
        const isCopper = segment.isCopper ?? DEFAULTS.IS_COPPER;
        const { x, y, align, verticalAlign } = getLabelPosition(segment, scaleFactor);
        
        const labelText = `${crossSection.toFixed(2)} mm² ${isCopper ? "Cu" : "Al"}`;
        
        return (
          <Text
            key={`label-${segIndex}`}
            x={x}
            y={y}
            text={labelText}
            fontSize={10}
            fontStyle="bold"
            align={align}
            verticalAlign={verticalAlign}
            padding={4}
            fill="#00000080"
            shadowBlur={2}
            shadowColor="#000000"
            shadowOpacity={0.5}
          />
        );
      })}
    </>
  );
}
