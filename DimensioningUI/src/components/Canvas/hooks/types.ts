import type { CableSegment, Point, Tool, HoveredPoint, TemperaturePreset } from "../types";

export type UseMouseHandlersProps = {
  cableEngine: unknown;
  segments: CableSegment[];
  activeTool: Tool;
  isSpacePressed: boolean;
  stagePosition: { x: number; y: number };
  scale: number;
  snapToGrid: boolean;
  popover: {
    visible: boolean;
    x: number;
    y: number;
    segmentIndex: number;
    crossSection: string;
    isCopper: boolean;
    temperature: TemperaturePreset;
  } | null;
  getNearestPoint: (point: Point, threshold?: number) => HoveredPoint | null;
  getNearestSegment: (point: Point, threshold?: number) => number | null;
  getNearestSegmentEndpoint: (point: Point, threshold?: number) => { segmentIndex: number; point: Point; isStart: boolean } | null;
  selectedSegmentIndices: number[];
  deleteSegment: (segmentIndex: number) => void;
  mergeSegments: (segmentIndex: number) => void;
  setIsPanning: (value: boolean) => void;
  setPanStart: (value: Point) => void;
  setIsDraggingPoint: (value: boolean) => void;
  setIsDraggingSegment: (value: boolean) => void;
  setSelectedSegmentIndices: (value: number[]) => void;
  setIsSelecting: (value: boolean) => void;
  setSelectionBox: (value: { start: Point; end: Point } | null) => void;
  setHoveredPointIndex: (value: HoveredPoint | null) => void;
  setDragStart: (value: Point) => void;
  setIsDrawing: (value: boolean) => void;
  setCurrentSegment: (points: Point[]) => void;
  setPopover: (popover: {
    visible: boolean;
    x: number;
    y: number;
    segmentIndex: number;
    crossSection: string;
    isCopper: boolean;
    temperature: TemperaturePreset;
  } | null) => void;
  onSegmentDoubleClick: (segmentIndex: number, mouseX?: number, mouseY?: number) => void;
};
