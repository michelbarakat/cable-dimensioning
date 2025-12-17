import { Circle } from "react-konva";
import type { CableSegment, Point, Tool, HoveredPoint } from "../types";
import { isConnectionPoint } from "../utils";

type PointLocation = {
  segIndex: number;
  pointIndex: number;
};

type PointState = {
  isHovered: boolean;
  isSelected: boolean;
  isCrossSection: boolean;
  connectionKey: string | null;
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

function createConnectionKey(segIndex: number, connectedIndex: number): string {
  return `${Math.min(segIndex, connectedIndex)}-${Math.max(segIndex, connectedIndex)}`;
}

function getCrossSectionInfo(
  location: PointLocation,
  segmentContext: SegmentContext
): { isCrossSection: boolean; connectionKey: string | null } {
  if (segmentContext.segment.connectedTo === undefined) {
    return { isCrossSection: false, connectionKey: null };
  }

  const connectedIndex = segmentContext.segment.connectedTo;
  const connectedSegment = segmentContext.segments[connectedIndex];
  const isCrossSection = isConnectionPoint(
    segmentContext.segment,
    location.pointIndex,
    connectedSegment
  );

  if (!isCrossSection) {
    return { isCrossSection: false, connectionKey: null };
  }

  const connectionKey = createConnectionKey(location.segIndex, connectedIndex);
  return { isCrossSection: true, connectionKey };
}

type PointStateContext = {
  location: PointLocation;
  segmentContext: SegmentContext;
  interactionState: InteractionState;
};

function getPointState(context: PointStateContext): PointState {
  const isHovered = isPointHovered(context.location, context.interactionState.hoveredPointIndex);
  const isSelected = isPointSelected(context.location, context.interactionState);
  const { isCrossSection, connectionKey } = getCrossSectionInfo(
    context.location,
    context.segmentContext
  );

  return { isHovered, isSelected, isCrossSection, connectionKey };
}

function getPointStyle(state: PointState): PointStyle {
  const radius = state.isSelected ? 6 : state.isHovered || state.isCrossSection ? 5 : 4;
  const fill = state.isCrossSection
    ? "#a855f7"
    : state.isSelected
      ? "#10b981"
      : state.isHovered
        ? "#60a5fa"
        : "#3b82f6";
  return { radius, fill };
}

function canHandleCrossSectionAction(state: PointState, activeTool: Tool): boolean {
  return state.isCrossSection && state.connectionKey !== null && activeTool !== "erase";
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
  activeTool: Tool;
  crossSectionValues: Map<string, number>;
  onCrossSectionDoubleClick: (connectionKey: string, x: number, y: number, value: number) => void;
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
  activeTool,
  crossSectionValues,
  onCrossSectionDoubleClick,
}: PointCircleProps) {
  const location: PointLocation = { segIndex, pointIndex };
  const segmentContext: SegmentContext = { segment, segments };
  const interactionState: InteractionState = { hoveredPointIndex, selectedSegmentIndex };
  const state = getPointState({ location, segmentContext, interactionState });
  const style = getPointStyle(state);

  const handleDblClick = (e: any) => {
    e.cancelBubble = true;
    if (!canHandleCrossSectionAction(state, activeTool)) {
      return;
    }

    const stage = e.target.getStage();
    if (!stage) {
      return;
    }

    const crossSectionValue = crossSectionValues.get(state.connectionKey!) ?? 2.5;
    const stagePos = stage.getPointerPosition();
    if (!stagePos || !state.connectionKey) {
      return;
    }
    onCrossSectionDoubleClick(state.connectionKey, stagePos.x, stagePos.y - 30, crossSectionValue);
  };

  const handleClick = (e: any) => {
    if (canHandleCrossSectionAction(state, activeTool)) {
      e.cancelBubble = true;
    }
  };

  return (
    <Circle
      key={`point-${location.segIndex}-${location.pointIndex}`}
      x={point.x * scaleFactor}
      y={point.y * scaleFactor}
      radius={style.radius}
      fill={style.fill}
      onDblClick={handleDblClick}
      onClick={handleClick}
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
  crossSectionValues: Map<string, number>;
  onCrossSectionDoubleClick: (connectionKey: string, x: number, y: number, value: number) => void;
};

export function SegmentPoints({
  segments,
  segIndex,
  segment,
  scaleFactor,
  hoveredPointIndex,
  selectedSegmentIndex,
  activeTool,
  crossSectionValues,
  onCrossSectionDoubleClick,
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
          activeTool={activeTool}
          crossSectionValues={crossSectionValues}
          onCrossSectionDoubleClick={onCrossSectionDoubleClick}
        />
      ))}
    </>
  );
}
