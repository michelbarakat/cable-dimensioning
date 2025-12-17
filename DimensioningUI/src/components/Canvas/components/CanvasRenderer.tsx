import { Layer, Line, Circle, Text } from "react-konva";
import { parseNumber } from "../../../lib/numberInput";
import type { CableSegment, Point, Tool, HoveredPoint } from "../types";
import { findConnectionPoint, isConnectionPoint } from "../utils";

type CanvasRendererProps = {
  gridLines: Array<{ points: number[]; key: string }>;
  segments: CableSegment[];
  currentPoints: Point[];
  selectedSegmentIndex: number | null;
  hoveredSegmentIndex: number | null;
  hoveredPointIndex: HoveredPoint | null;
  activeTool: Tool;
  crossSectionValues: Map<string, number>;
  crossSection: string;
  onCrossSectionDoubleClick: (connectionKey: string, x: number, y: number, value: number) => void;
};

export function CanvasRenderer({
  gridLines,
  segments,
  currentPoints,
  selectedSegmentIndex,
  hoveredSegmentIndex,
  hoveredPointIndex,
  activeTool,
  crossSectionValues,
  crossSection,
  scale,
  baseScale,
  onCrossSectionDoubleClick,
}: CanvasRendererProps) {
  // Calculate scale factor for rendering
  const scaleFactor = baseScale > 0 ? scale / baseScale : 1;

  return (
    <Layer>
      {/* Draw grid */}
      {gridLines.map((line) => (
        <Line
          key={line.key}
          points={line.points}
          stroke="#4b5563"
          strokeWidth={0.5}
          opacity={0.3}
          listening={false}
        />
      ))}
      {/* Draw completed segments */}
      {segments.map((segment, segIndex) => (
        <Line
          key={`segment-${segIndex}`}
          points={segment.points.flatMap((p) => [p.x * scaleFactor, p.y * scaleFactor])}
          stroke={
            selectedSegmentIndex === segIndex
              ? "#10b981"
              : hoveredSegmentIndex === segIndex
                ? "#60a5fa"
                : "#3b82f6"
          }
          strokeWidth={selectedSegmentIndex === segIndex ? 4 : 3}
          lineCap="round"
          lineJoin="round"
        />
      ))}
      {/* Draw current segment being drawn */}
      {currentPoints.length > 1 && (
        <Line
          points={currentPoints.flatMap((p) => [p.x * scaleFactor, p.y * scaleFactor])}
          stroke="#60a5fa"
          strokeWidth={3}
          lineCap="round"
          lineJoin="round"
          dash={[5, 5]}
        />
      )}
      {/* Draw points */}
      {segments.map((segment, segIndex) =>
        segment.points.map((point, pointIndex) => {
          const isHovered =
            hoveredPointIndex?.segment === segIndex &&
            hoveredPointIndex?.point === pointIndex;
          const isSelected =
            selectedSegmentIndex === segIndex &&
            hoveredPointIndex?.segment === segIndex &&
            hoveredPointIndex?.point === pointIndex;

          // Check if this is a connection point between two segments (cross-section)
          let isCrossSection = false;
          let connectionKey: string | null = null;
          if (segment.connectedTo !== undefined) {
            const connectedIndex = segment.connectedTo;
            const connectedSegment = segments[connectedIndex];
            isCrossSection = isConnectionPoint(
              segment,
              pointIndex,
              connectedSegment
            );
            if (isCrossSection) {
              connectionKey = `${Math.min(segIndex, connectedIndex)}-${Math.max(segIndex, connectedIndex)}`;
            }
          }

          return (
            <Circle
              key={`point-${segIndex}-${pointIndex}`}
              x={point.x * scaleFactor}
              y={point.y * scaleFactor}
              radius={
                isSelected ? 6 : isHovered ? 5 : isCrossSection ? 5 : 4
              }
              fill={
                isCrossSection
                  ? "#a855f7"
                  : isSelected
                    ? "#10b981"
                    : isHovered
                      ? "#60a5fa"
                      : "#3b82f6"
              }
              onDblClick={(e) => {
                e.cancelBubble = true;
                if (isCrossSection && connectionKey && activeTool !== "erase") {
                  const stage = e.target.getStage();
                  const crossSectionValue = crossSectionValues.get(connectionKey) ?? 2.5;
                  const stagePos = stage.getPointerPosition();
                  onCrossSectionDoubleClick(connectionKey, stagePos.x, stagePos.y - 30, crossSectionValue);
                }
              }}
              onClick={(e) => {
                // Prevent single click from interfering with double-click
                if (isCrossSection && connectionKey && activeTool !== "erase") {
                  e.cancelBubble = true;
                }
              }}
            />
          );
        })
      )}
      {currentPoints.map((point, index) => (
        <Circle
          key={`current-point-${index}`}
          x={point.x * scaleFactor}
          y={point.y * scaleFactor}
          radius={4}
          fill="#60a5fa"
        />
      ))}
      {/* Draw cross-section labels */}
      {segments.map((segment, segIndex) => {
        if (segment.connectedTo === undefined) return null;
        const connectedIndex = segment.connectedTo;
        
        // Only render label once per connection pair (when segIndex < connectedIndex)
        if (segIndex >= connectedIndex) return null;
        
        const connectedSegment = segments[connectedIndex];

        const connectionPoint = findConnectionPoint(segment, connectedSegment);
        if (!connectionPoint) return null;

        const connectionKey = `${segIndex}-${connectedIndex}`;
        const crossSectionValue =
          crossSectionValues.get(connectionKey) ?? 2.5;

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
    </Layer>
  );
}

