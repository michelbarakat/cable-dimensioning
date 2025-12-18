import { Layer, Line, Circle } from "react-konva";
import type { CableSegment, Point, Tool, HoveredPoint } from "../types";
import { SegmentPoints } from "./PointRenderer";
import { SegmentLabels } from "./SegmentLabels";
import { DEFAULTS } from "../../../lib/defaults";

type CanvasRendererProps = {
  gridLines: Array<{ points: number[]; key: string }>;
  segments: CableSegment[];
  currentPoints: Point[];
  selectedSegmentIndex: number | null;
  hoveredSegmentIndex: number | null;
  hoveredPointIndex: HoveredPoint | null;
  activeTool: Tool;
  scale: number;
  baseScale: number;
  current: string;
  onSegmentDoubleClick: (segmentIndex: number, x: number, y: number) => void;
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
  onSegmentDoubleClick,
}: {
  segment: CableSegment;
  segIndex: number;
  scaleFactor: number;
  selectedSegmentIndex: number | null;
  hoveredSegmentIndex: number | null;
  onSegmentDoubleClick: (segmentIndex: number, x: number, y: number) => void;
}) {
  const isCopper = segment.isCopper ?? DEFAULTS.IS_COPPER;
  const crossSection = segment.crossSection ?? DEFAULTS.CROSS_SECTION;
  
  // Color based on material: copper = orange/brown, aluminum = silver/gray
  const baseColor = isCopper ? "#f97316" : "#94a3b8"; // Copper: orange, Aluminum: gray
  
  // Thickness based on cross-section (default = 3px base, scales up)
  const baseThickness = 3;
  const thicknessMultiplier = Math.max(1, crossSection / DEFAULTS.CROSS_SECTION);
  const strokeWidth = baseThickness * thicknessMultiplier;
  
  // Use base color for all states, adjust opacity for hover/selection
  const stroke = baseColor;
  const opacity = selectedSegmentIndex === segIndex
    ? 1.0
    : hoveredSegmentIndex === segIndex
      ? 1.0
      : 0.8;

  const handleDblClick = (e: any) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    if (stage) {
      const pos = stage.getPointerPosition();
      if (pos) {
        onSegmentDoubleClick(segIndex, pos.x, pos.y);
      }
    }
  };

  return (
    <Line
      key={`segment-${segIndex}`}
      points={segment.points.flatMap((p) => [p.x * scaleFactor, p.y * scaleFactor])}
      stroke={stroke}
      strokeWidth={selectedSegmentIndex === segIndex ? strokeWidth + 1 : strokeWidth}
      opacity={opacity}
      lineCap="round"
      lineJoin="round"
      onDblClick={handleDblClick}
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
  scale,
  baseScale,
  current,
  onSegmentDoubleClick,
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
          onSegmentDoubleClick={onSegmentDoubleClick}
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
      <SegmentLabels
        segments={segments}
        scaleFactor={scaleFactor}
        current={current}
      />
    </Layer>
  );
}

