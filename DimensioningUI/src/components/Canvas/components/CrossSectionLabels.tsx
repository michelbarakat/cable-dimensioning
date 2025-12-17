import { Text } from "react-konva";
import type { CableSegment } from "../types";
import { findConnectionPoint } from "../utils";

type CrossSectionLabelsProps = {
  segments: CableSegment[];
  scaleFactor: number;
  crossSectionValues: Map<string, number>;
};

export function CrossSectionLabels({
  segments,
  scaleFactor,
  crossSectionValues,
}: CrossSectionLabelsProps) {
  return (
    <>
      {segments.map((segment, segIndex) => {
        if (segment.connectedTo === undefined) return null;
        const connectedIndex = segment.connectedTo;

        if (segIndex >= connectedIndex) return null;

        const connectedSegment = segments[connectedIndex];
        const connectionPoint = findConnectionPoint(segment, connectedSegment);
        if (!connectionPoint) return null;

        const connectionKey = `${segIndex}-${connectedIndex}`;
        const crossSectionValue = crossSectionValues.get(connectionKey) ?? 2.5;

        return (
          <Text
            key={`label-${connectionKey}`}
            x={connectionPoint.x * scaleFactor}
            y={connectionPoint.y * scaleFactor - 15}
            text={`${crossSectionValue.toFixed(2)} mm²`}
            fontSize={10}
            fill="#a855f7"
            fontStyle="bold"
            align="center"
            offsetX={25}
          />
        );
      })}
    </>
  );
}
