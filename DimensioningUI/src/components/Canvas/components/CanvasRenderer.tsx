import { Layer, Line, Circle, Rect, Image } from "react-konva";
import type { CableSegment, Point, Tool, HoveredPoint } from "../types";
import { SegmentPoints } from "./PointRenderer";
import { SegmentLabels } from "./SegmentLabels";
import { DEFAULTS } from "../../../lib/defaults";
import { getSortedSegmentIndices } from "../utils";

type CanvasRendererProps = {
  gridLines: Array<{ points: number[]; key: string }>;
  segments: CableSegment[];
  currentPoints: Point[];
  selectedSegmentIndices: number[];
  hoveredSegmentIndex: number | null;
  hoveredPointIndex: HoveredPoint | null;
  activeTool: Tool;
  scale: number;
  baseScale: number;
  current: string;
  selectionBox: { start: Point; end: Point } | null;
  onSegmentDoubleClick: (segmentIndex: number) => void;
  floorplanImage: HTMLImageElement | null;
  stageSize: { width: number; height: number };
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
          opacity={0.2}
          listening={false}
        />
      ))}
    </>
  );
}

function isValidSegment(segment: CableSegment | null | undefined): boolean {
  if (!segment) return false;
  if (!segment.points) return false;
  if (!Array.isArray(segment.points)) return false;
  return segment.points.length > 0;
}

function FloorplanLayer({
  floorplanImage,
  stageSize,
}: {
  floorplanImage: HTMLImageElement | null;
  stageSize: { width: number; height: number };
}) {
  if (!floorplanImage) return null;

  const x = (stageSize.width - floorplanImage.width) / 2;
  const y = (stageSize.height - floorplanImage.height) / 2;

  return (
    <Layer>
      <Image
        image={floorplanImage}
        x={x}
        y={y}
        width={floorplanImage.width}
        height={floorplanImage.height}
        listening={false}
        opacity={0.7}
      />
    </Layer>
  );
}

type DrawingLayerProps = {
  gridLines: Array<{ points: number[]; key: string }>;
  segments: CableSegment[];
  sortedIndices: number[];
  scaleFactor: number;
  selectedSegmentIndices: number[];
  hoveredSegmentIndex: number | null;
  hoveredPointIndex: HoveredPoint | null;
  activeTool: Tool;
  selectionBox: { start: Point; end: Point } | null;
  currentPoints: Point[];
  current: string;
  onSegmentDoubleClick: (segmentIndex: number) => void;
};

function SelectionBox({ selectionBox, scaleFactor }: { selectionBox: { start: Point; end: Point } | null; scaleFactor: number }) {
  if (!selectionBox) return null;
  
  return (
    <Rect
      x={Math.min(selectionBox.start.x, selectionBox.end.x) * scaleFactor}
      y={Math.min(selectionBox.start.y, selectionBox.end.y) * scaleFactor}
      width={Math.abs(selectionBox.end.x - selectionBox.start.x) * scaleFactor}
      height={Math.abs(selectionBox.end.y - selectionBox.start.y) * scaleFactor}
      stroke="#3b82f6"
      strokeWidth={1}
      fill="rgba(59, 130, 246, 0.1)"
      dash={[5, 5]}
      listening={false}
    />
  );
}

function CurrentSegmentLine({ currentPoints, scaleFactor }: { currentPoints: Point[]; scaleFactor: number }) {
  if (currentPoints.length <= 1) return null;
  
  return (
    <Line
      points={currentPoints.flatMap((p) => [p.x * scaleFactor, p.y * scaleFactor])}
      stroke="#60a5fa"
      strokeWidth={3}
      lineCap="round"
      lineJoin="round"
      dash={[5, 5]}
    />
  );
}

function CurrentPoints({ currentPoints, scaleFactor }: { currentPoints: Point[]; scaleFactor: number }) {
  return (
    <>
      {currentPoints.map((point, index) => (
        <Circle
          key={`current-point-${index}`}
          x={point.x * scaleFactor}
          y={point.y * scaleFactor}
          radius={4}
          fill="#60a5fa"
        />
      ))}
    </>
  );
}

function SegmentsList({
  segments,
  sortedIndices,
  scaleFactor,
  selectedSegmentIndices,
  hoveredSegmentIndex,
  onSegmentDoubleClick,
}: {
  segments: CableSegment[];
  sortedIndices: number[];
  scaleFactor: number;
  selectedSegmentIndices: number[];
  hoveredSegmentIndex: number | null;
  onSegmentDoubleClick: (segmentIndex: number) => void;
}) {
  return (
    <>
      {sortedIndices.map((segIndex) => {
        const segment = segments[segIndex];
        if (!isValidSegment(segment)) {
          return null;
        }
        return (
          <SegmentLine
            key={`segment-${segIndex}`}
            segment={segment}
            segIndex={segIndex}
            scaleFactor={scaleFactor}
            selectedSegmentIndices={selectedSegmentIndices}
            hoveredSegmentIndex={hoveredSegmentIndex}
            onSegmentDoubleClick={onSegmentDoubleClick}
          />
        );
      })}
    </>
  );
}

function SegmentPointsList({
  segments,
  sortedIndices,
  scaleFactor,
  hoveredPointIndex,
  selectedSegmentIndices,
  activeTool,
}: {
  segments: CableSegment[];
  sortedIndices: number[];
  scaleFactor: number;
  hoveredPointIndex: HoveredPoint | null;
  selectedSegmentIndices: number[];
  activeTool: Tool;
}) {
  return (
    <>
      {sortedIndices.map((segIndex) => {
        const segment = segments[segIndex];
        if (!isValidSegment(segment)) {
          return null;
        }
        return (
          <SegmentPoints
            key={`points-${segIndex}`}
            segments={segments}
            segIndex={segIndex}
            segment={segment}
            scaleFactor={scaleFactor}
            hoveredPointIndex={hoveredPointIndex}
            selectedSegmentIndices={selectedSegmentIndices}
            activeTool={activeTool}
          />
        );
      })}
    </>
  );
}

function DrawingLayer({
  gridLines,
  segments,
  sortedIndices,
  scaleFactor,
  selectedSegmentIndices,
  hoveredSegmentIndex,
  hoveredPointIndex,
  activeTool,
  selectionBox,
  currentPoints,
  current,
  onSegmentDoubleClick,
}: DrawingLayerProps) {
  return (
    <Layer>
      <GridLines gridLines={gridLines} />
      <SegmentsList
        segments={segments}
        sortedIndices={sortedIndices}
        scaleFactor={scaleFactor}
        selectedSegmentIndices={selectedSegmentIndices}
        hoveredSegmentIndex={hoveredSegmentIndex}
        onSegmentDoubleClick={onSegmentDoubleClick}
      />
      <SelectionBox selectionBox={selectionBox} scaleFactor={scaleFactor} />
      <CurrentSegmentLine currentPoints={currentPoints} scaleFactor={scaleFactor} />
      <SegmentPointsList
        segments={segments}
        sortedIndices={sortedIndices}
        scaleFactor={scaleFactor}
        hoveredPointIndex={hoveredPointIndex}
        selectedSegmentIndices={selectedSegmentIndices}
        activeTool={activeTool}
      />
      <CurrentPoints currentPoints={currentPoints} scaleFactor={scaleFactor} />
      <SegmentLabels
        segments={segments}
        scaleFactor={scaleFactor}
        current={current}
        selectedSegmentIndices={selectedSegmentIndices}
      />
    </Layer>
  );
}

function SegmentLine({
  segment,
  segIndex,
  scaleFactor,
  selectedSegmentIndices,
  hoveredSegmentIndex,
  onSegmentDoubleClick,
}: {
  segment: CableSegment;
  segIndex: number;
  scaleFactor: number;
  selectedSegmentIndices: number[];
  hoveredSegmentIndex: number | null;
  onSegmentDoubleClick: (segmentIndex: number) => void;
}) {
  const isCopper = segment.isCopper ?? DEFAULTS.IS_COPPER;
  const crossSection = segment.crossSection ?? DEFAULTS.CROSS_SECTION;
  
  // Color based on material: copper = orange/brown, aluminum = silver/gray
  const baseColor = isCopper ? "#f97316" : "#94a3b8"; // Copper: orange, Aluminum: gray
  
  // Thickness based on cross-section (default = 3px base, scales up)
  const baseThickness = 3;
  const thicknessMultiplier = Math.max(1, crossSection / DEFAULTS.CROSS_SECTION);
  const strokeWidth = baseThickness * thicknessMultiplier;
  
  const isSelected = selectedSegmentIndices.includes(segIndex);
  
  // Use base color for all states, adjust opacity for hover/selection
  const stroke = baseColor;
  const opacity = isSelected
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
        onSegmentDoubleClick(segIndex);
      }
    }
  };

  // Safety check: ensure segment.points exists and is valid
  if (!isValidSegment(segment)) {
    return null;
  }

  return (
    <Line
      key={`segment-${segIndex}`}
      points={segment.points.flatMap((p) => [p.x * scaleFactor, p.y * scaleFactor])}
      stroke={stroke}
      strokeWidth={isSelected ? strokeWidth + 1 : strokeWidth}
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
  selectedSegmentIndices,
  hoveredSegmentIndex,
  hoveredPointIndex,
  activeTool,
  scale,
  baseScale,
  current,
  selectionBox,
  onSegmentDoubleClick,
  floorplanImage,
  stageSize,
}: CanvasRendererProps) {
  const scaleFactor = baseScale > 0 ? scale / baseScale : 1;
  const sortedIndices = getSortedSegmentIndices(segments, selectedSegmentIndices);

  return (
    <>
      <FloorplanLayer floorplanImage={floorplanImage} stageSize={stageSize} />
      <DrawingLayer
        gridLines={gridLines}
        segments={segments}
        sortedIndices={sortedIndices}
        scaleFactor={scaleFactor}
        selectedSegmentIndices={selectedSegmentIndices}
        hoveredSegmentIndex={hoveredSegmentIndex}
        hoveredPointIndex={hoveredPointIndex}
        activeTool={activeTool}
        selectionBox={selectionBox}
        currentPoints={currentPoints}
        current={current}
        onSegmentDoubleClick={onSegmentDoubleClick}
      />
    </>
  );
}

