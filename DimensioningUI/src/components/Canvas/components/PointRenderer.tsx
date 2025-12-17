import { Circle } from "react-konva";
import type { CableSegment, Point, Tool, HoveredPoint } from "../types";

type PointLocation = {
  segIndex: number;
  pointIndex: number;
};

type PointState = {
  isHovered: boolean;
  isSelected: boolean;
};

type PointStyle = {
  radius: number;
  fill: string;
};

type SegmentContext = {
  segment: CableSegment;
  segments: CableSegment[];
};

type InteractionState = {
  hoveredPointIndex: HoveredPoint | null;
  selectedSegmentIndex: number | null;
};

function isPointHovered(
  location: PointLocation,
  hoveredPointIndex: HoveredPoint | null
): boolean {
  return hoveredPointIndex?.segment === location.segIndex && hoveredPointIndex?.point === location.pointIndex;
}

function isPointSelected(
  location: PointLocation,
  interactionState: InteractionState
): boolean {
  return (
    interactionState.selectedSegmentIndex === location.segIndex &&
    isPointHovered(location, interactionState.hoveredPointIndex)
  );
}


type PointStateContext = {
  location: PointLocation;
  segmentContext: SegmentContext;
  interactionState: InteractionState;
};

function getPointState(context: PointStateContext): PointState {
  const isHovered = isPointHovered(context.location, context.interactionState.hoveredPointIndex);
  const isSelected = isPointSelected(context.location, context.interactionState);

  return { isHovered, isSelected };
}

function getPointStyle(state: PointState): PointStyle {
  const radius = state.isSelected ? 6 : state.isHovered ? 5 : 4;
  const fill = state.isSelected
    ? "#10b981"
    : state.isHovered
      ? "#60a5fa"
      : "#3b82f6";
  return { radius, fill };
}

type PointCircleProps = {
  point: Point;
  segIndex: number;
  pointIndex: number;
  scaleFactor: number;
  segment: CableSegment;
  segments: CableSegment[];
  hoveredPointIndex: HoveredPoint | null;
  selectedSegmentIndex: number | null;
};

function PointCircle({
  point,
  segIndex,
  pointIndex,
  scaleFactor,
  segment,
  segments,
  hoveredPointIndex,
  selectedSegmentIndex,
}: PointCircleProps) {
  const location: PointLocation = { segIndex, pointIndex };
  const segmentContext: SegmentContext = { segment, segments };
  const interactionState: InteractionState = { hoveredPointIndex, selectedSegmentIndex };
  const state = getPointState({ location, segmentContext, interactionState });
  const style = getPointStyle(state);

  return (
    <Circle
      key={`point-${location.segIndex}-${location.pointIndex}`}
      x={point.x * scaleFactor}
      y={point.y * scaleFactor}
      radius={style.radius}
      fill={style.fill}
    />
  );
}

type SegmentPointsProps = {
  segments: CableSegment[];
  segIndex: number;
  segment: CableSegment;
  scaleFactor: number;
  hoveredPointIndex: HoveredPoint | null;
  selectedSegmentIndex: number | null;
  activeTool: Tool;
};

export function SegmentPoints({
  segments,
  segIndex,
  segment,
  scaleFactor,
  hoveredPointIndex,
  selectedSegmentIndex,
  activeTool,
}: SegmentPointsProps) {
  return (
    <>
      {segment.points.map((point, pointIndex) => (
        <PointCircle
          key={`point-${segIndex}-${pointIndex}`}
          point={point}
          segIndex={segIndex}
          pointIndex={pointIndex}
          scaleFactor={scaleFactor}
          segment={segment}
          segments={segments}
          hoveredPointIndex={hoveredPointIndex}
          selectedSegmentIndex={selectedSegmentIndex}
        />
      ))}
    </>
  );
}
