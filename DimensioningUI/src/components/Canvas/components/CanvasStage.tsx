import { Stage } from "react-konva";
import type { CableSegment, Point, Tool, HoveredPoint } from "../types";
import { CanvasRenderer } from "./CanvasRenderer";

type CanvasStageProps = {
  stageSize: { width: number; height: number };
  stagePosition: { x: number; y: number };
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
  handleMouseDown: (e: any) => void;
  handleMouseMove: (e: any) => void;
  handleMouseUp: () => void;
  stageRef: React.RefObject<any>;
  cursor: string;
};

export function CanvasStage({
  stageSize,
  stagePosition,
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
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  stageRef,
  cursor,
}: CanvasStageProps) {
  return (
    <div
      className="bg-white rounded border-2 border-gray-600 w-full relative"
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
          selectedSegmentIndex={selectedSegmentIndex}
          hoveredSegmentIndex={hoveredSegmentIndex}
          hoveredPointIndex={hoveredPointIndex}
          activeTool={activeTool}
          crossSectionValues={crossSectionValues}
          crossSection={crossSection}
          scale={scale}
          baseScale={baseScale}
          onCrossSectionDoubleClick={onCrossSectionDoubleClick}
        />
      </Stage>
    </div>
  );
}

