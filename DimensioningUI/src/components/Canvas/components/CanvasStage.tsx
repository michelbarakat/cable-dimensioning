import { Stage } from "react-konva";
import type { CableSegment, Point, Tool, HoveredPoint } from "../types";
import { CanvasRenderer } from "./CanvasRenderer";

type CanvasStageProps = {
  stageSize: { width: number; height: number };
  stagePosition: { x: number; y: number };
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
  handleMouseDown: (e: any) => void;
  handleMouseMove: (e: any) => void;
  handleMouseUp: () => void;
  stageRef: React.RefObject<any>;
  cursor: string;
  floorplanImage: HTMLImageElement | null;
};

export function CanvasStage({
  stageSize,
  stagePosition,
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
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  stageRef,
  cursor,
  floorplanImage,
}: CanvasStageProps) {
  return (
    <div
      className="bg-white w-full relative h-full"
      style={{ cursor }}
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        ref={stageRef}
        x={stagePosition.x}
        y={stagePosition.y}
      >
        <CanvasRenderer
          gridLines={gridLines}
          segments={segments}
          currentPoints={currentPoints}
          selectedSegmentIndices={selectedSegmentIndices}
          hoveredSegmentIndex={hoveredSegmentIndex}
          hoveredPointIndex={hoveredPointIndex}
          activeTool={activeTool}
          scale={scale}
          baseScale={baseScale}
          current={current}
          selectionBox={selectionBox}
          onSegmentDoubleClick={onSegmentDoubleClick}
          floorplanImage={floorplanImage}
          stageSize={stageSize}
        />
      </Stage>
    </div>
  );
}

