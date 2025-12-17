import { Layer, Line, Circle } from "react-konva";
import type { CableSegment, Point, Tool, HoveredPoint } from "../types";
import { SegmentPoints } from "./PointRenderer";
import { CrossSectionLabels } from "./CrossSectionLabels";

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
  scale: number;
  baseScale: number;
  onCrossSectionDoubleClick: (connectionKey: string, x: number, y: number, value: number) => void;
};

function GridLines({ gridLines }: { gridLines: Array<{ points: number[]; key: string }> }) {
  return (
    <>
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
    </>
  );
}

function SegmentLine({
  segment,
  segIndex,
  scaleFactor,
  selectedSegmentIndex,
  hoveredSegmentIndex,
}: {
  segment: CableSegment;
  segIndex: number;
  scaleFactor: number;
  selectedSegmentIndex: number | null;
  hoveredSegmentIndex: number | null;
}) {
  const stroke =
    selectedSegmentIndex === segIndex
      ? "#10b981"
      : hoveredSegmentIndex === segIndex
        ? "#60a5fa"
        : "#3b82f6";

  return (
    <Line
      key={`segment-${segIndex}`}
      points={segment.points.flatMap((p) => [p.x * scaleFactor, p.y * scaleFactor])}
      stroke={stroke}
      strokeWidth={selectedSegmentIndex === segIndex ? 4 : 3}
      lineCap="round"
      lineJoin="round"
    />
  );
}


export function CanvasRenderer({
  gridLines,
  segments,
  currentPoints,
  selectedSegmentIndex,
  hoveredSegmentIndex,
  hoveredPointIndex,
  activeTool,
  crossSectionValues,
  scale,
  baseScale,
  onCrossSectionDoubleClick,
}: CanvasRendererProps) {
  // Calculate scale factor for rendering
  const scaleFactor = baseScale > 0 ? scale / baseScale : 1;

  return (
    <Layer>
      <GridLines gridLines={gridLines} />
      {segments.map((segment, segIndex) => (
        <SegmentLine
          key={`segment-${segIndex}`}
          segment={segment}
          segIndex={segIndex}
          scaleFactor={scaleFactor}
          selectedSegmentIndex={selectedSegmentIndex}
          hoveredSegmentIndex={hoveredSegmentIndex}
        />
      ))}
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
      {segments.map((segment, segIndex) => (
        <SegmentPoints
          key={`points-${segIndex}`}
          segments={segments}
          segIndex={segIndex}
          segment={segment}
          scaleFactor={scaleFactor}
          hoveredPointIndex={hoveredPointIndex}
          selectedSegmentIndex={selectedSegmentIndex}
          activeTool={activeTool}
          crossSectionValues={crossSectionValues}
          onCrossSectionDoubleClick={onCrossSectionDoubleClick}
        />
      ))}
      {currentPoints.map((point, index) => (
        <Circle
          key={`current-point-${index}`}
          x={point.x * scaleFactor}
          y={point.y * scaleFactor}
          radius={4}
          fill="#60a5fa"
        />
      ))}
      <CrossSectionLabels
        segments={segments}
        scaleFactor={scaleFactor}
        crossSectionValues={crossSectionValues}
      />
    </Layer>
  );
}

