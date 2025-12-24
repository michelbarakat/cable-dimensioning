import type React from "react";
import type { Point, HoveredPoint, CableSegment } from "../types";
import { isConnectionPoint } from "../utils";

// Helper function to check if interaction is on selected segment
export const isOnSelectedSegment = (
  nearestSegment: number | null,
  selectedSegmentIndex: number | null
): boolean => selectedSegmentIndex !== null && nearestSegment === selectedSegmentIndex;

// Helper function to check if interaction is on selected point
export const isOnSelectedPoint = (
  nearestPoint: HoveredPoint | null,
  selectedSegmentIndex: number | null
): boolean => nearestPoint !== null && nearestPoint.segment === selectedSegmentIndex;

type SelectedSegmentInteractionParams = {
  stagePoint: Point;
  nearestPoint: HoveredPoint | null;
  nearestSegment: number | null;
  selectedSegmentIndices: number[];
  checkDoubleClick: (idx: number | null) => boolean;
  onPointDrag: (point: HoveredPoint, stage: Point) => void;
  onBodyDrag: (stage: Point) => void;
  onDeselect: () => void;
};

// Helper to check if a segment is selected
const isSegmentSelected = (segmentIndex: number | null, selectedIndices: number[]): boolean => 
  segmentIndex !== null && selectedIndices.includes(segmentIndex);

type InteractionHandlers = {
  checkDoubleClick: (idx: number | null) => boolean;
  onPointDrag: (point: HoveredPoint, stage: Point) => void;
  onBodyDrag: (stage: Point) => void;
};

type InteractionContext = {
  isOnSelectedSegment: boolean;
  hasNearestPoint: boolean;
  hasNearestSegment: boolean;
  nearestSegment: number | null;
  nearestPoint: HoveredPoint | null;
  selectedSegmentIndices: number[];
  stagePoint: Point;
  handlers: InteractionHandlers;
};

// Helper to try double-click interaction
const tryDoubleClick = (context: InteractionContext): boolean => {
  const canDoubleClick = context.isOnSelectedSegment && context.hasNearestSegment;
  if (!canDoubleClick) return false;
  return context.handlers.checkDoubleClick(context.nearestSegment);
};

// Helper to try body drag interaction
const tryBodyDrag = (context: InteractionContext): boolean => {
  const canBodyDrag = context.isOnSelectedSegment && !context.hasNearestPoint;
  if (!canBodyDrag) return false;
  context.handlers.onBodyDrag(context.stagePoint);
  return true;
};

// Helper to try point drag interaction
const tryPointDrag = (context: InteractionContext): boolean => {
  if (!context.hasNearestPoint || context.nearestPoint === null) return false;
  const isPointOnSelected = isSegmentSelected(context.nearestPoint.segment, context.selectedSegmentIndices);
  if (!isPointOnSelected) return false;
  context.handlers.onPointDrag(context.nearestPoint, context.stagePoint);
  return true;
};

// Helper to try all interaction types and return which one was handled
const tryInteractions = (context: InteractionContext): boolean => {
  if (tryDoubleClick(context)) return true;
  if (tryBodyDrag(context)) return true;
  if (tryPointDrag(context)) return true;
  return false;
};

// Helper to process selected segment interaction
export const processSelectedSegmentInteraction = (params: SelectedSegmentInteractionParams): boolean => {
  const { stagePoint, nearestPoint, nearestSegment, selectedSegmentIndices, checkDoubleClick, onPointDrag, onBodyDrag, onDeselect } = params;
  if (selectedSegmentIndices.length === 0) return false;
  
  const isOnSelectedSegment = isSegmentSelected(nearestSegment, selectedSegmentIndices);
  const hasNearestPoint = nearestPoint !== null;
  const hasNearestSegment = nearestSegment !== null;
  
  const handlers: InteractionHandlers = { checkDoubleClick, onPointDrag, onBodyDrag };
  const context: InteractionContext = {
    isOnSelectedSegment,
    hasNearestPoint,
    hasNearestSegment,
    nearestSegment,
    nearestPoint,
    selectedSegmentIndices,
    stagePoint,
    handlers,
  };
  
  if (tryInteractions(context)) return true;
  
  if (!isOnSelectedSegment) onDeselect();
  return isOnSelectedSegment;
};

// Helper to calculate segment midpoint
export const calculateSegmentMidpoint = (segment: CableSegment): Point => {
  const pointCount = segment.points.length;
  const midIndex = Math.floor(pointCount / 2);
  return segment.points[midIndex] || segment.points[0];
};

// Helper to check if it's a double-click
export const isDoubleClick = (
  segmentIndex: number,
  lastClick: { time: number; point: HoveredPoint | null },
  now: number
): boolean => {
  const lastPoint = lastClick.point;
  return lastPoint !== null && lastPoint.segment === segmentIndex && now - lastClick.time < 300;
};

// Helper to create tool handlers map
export const createToolHandlers = <T extends Record<string, (p: Point) => any>>(handlers: T): T => handlers;

// Helper to create drag handlers
export const createDragHandlers = (
  setIsDraggingPoint: (value: boolean) => void,
  setHoveredPointIndex: (value: HoveredPoint | null) => void,
  setDragStart: (value: Point) => void,
  setIsDraggingSegment: (value: boolean) => void
) => ({
  pointDrag: (nearestPoint: HoveredPoint, stagePoint: Point) => {
    setIsDraggingPoint(true);
    setHoveredPointIndex(nearestPoint);
    setDragStart(stagePoint);
  },
  bodyDrag: (stagePoint: Point) => {
    setIsDraggingSegment(true);
    setDragStart(stagePoint);
  },
});

// Helper to create panning handler
export const createPanningHandler = (
  setIsPanning: (value: boolean) => void,
  setPanStart: (value: Point) => void,
  stagePosition: { x: number; y: number },
  popover: { visible: boolean } | null,
  setPopover: (popover: null) => void
) => (point: { x: number; y: number }) => {
  setIsPanning(true);
  setPanStart({ x: point.x - stagePosition.x, y: point.y - stagePosition.y });
  if (popover?.visible) setPopover(null);
};

// Helper to create drawing starter
export const createDrawingStarter = (
  setIsDrawing: (value: boolean) => void,
  setCurrentSegment: (points: Point[]) => void,
  snapPoint: (point: Point) => Point
) => (point: Point) => {
  setIsDrawing(true);
  setCurrentSegment([snapPoint(point)]);
};

type DoubleClickHandlerConfig = {
  lastClickRef: React.MutableRefObject<{ time: number; point: HoveredPoint | null }>;
  onSegmentDoubleClick: (segmentIndex: number, mouseX?: number, mouseY?: number) => void;
  clearDragTimeout: () => void;
};

// Helper to create double-click handler
export const createDoubleClickHandler = (config: DoubleClickHandlerConfig) => 
  (segmentIndex: number | null): boolean => processDoubleClick({ segmentIndex, ...config });

type EraseToolHandlerConfig = {
  segments: CableSegment[];
  getNearestPoint: (point: Point, threshold?: number) => HoveredPoint | null;
  getNearestSegment: (point: Point, threshold?: number) => number | null;
  mergeSegments: (segmentIndex: number) => void;
  deleteSegment: (segmentIndex: number) => void;
};

// Helper to create erase tool handler
export const createEraseToolHandler = (config: EraseToolHandlerConfig) => 
  (stagePoint: Point): boolean => processEraseTool({ stagePoint, ...config });

type LineToolHandlerConfig = {
  selectedSegmentIndex: number | null;
  getNearestSegment: (point: Point, threshold?: number) => number | null;
  getNearestSegmentEndpoint: (point: Point, threshold?: number) => { segmentIndex: number; point: Point; isStart: boolean } | null;
  checkAndHandleDoubleClick: (segmentIndex: number | null) => boolean;
  startDrawing: (point: Point) => void;
  setSelectedSegmentIndex: (value: number | null) => void;
};

// Helper to create line tool handler
export const createLineToolHandler = (config: LineToolHandlerConfig) => 
  (stagePoint: Point): void => processLineTool({ stagePoint, ...config });

type SelectToolHandlerConfig = {
  selectedSegmentIndices: number[];
  getNearestPoint: (point: Point, threshold?: number) => HoveredPoint | null;
  getNearestSegment: (point: Point, threshold?: number) => number | null;
  handleSelectedSegmentInteraction: (stagePoint: Point, nearestPoint: HoveredPoint | null, nearestSegment: number | null) => boolean;
  checkAndHandleDoubleClick: (segmentIndex: number | null) => boolean;
  setSelectedSegmentIndices: (value: number[]) => void;
  setIsSelecting: (value: boolean) => void;
  setSelectionBox: (value: { start: Point; end: Point } | null) => void;
  setDragStart: (value: Point) => void;
};

// Helper to create select tool handler
export const createSelectToolHandler = (config: SelectToolHandlerConfig) => 
  (stagePoint: Point): void => processSelectTool({ stagePoint, ...config });

type ProcessDoubleClickConfig = {
  segmentIndex: number | null;
  lastClickRef: { current: { time: number; point: HoveredPoint | null } };
  onSegmentDoubleClick: (segmentIndex: number, mouseX?: number, mouseY?: number) => void;
  clearDragTimeout: () => void;
};

// Helper to handle double-click check and execution
export const processDoubleClick = (config: ProcessDoubleClickConfig): boolean => {
  const { segmentIndex, lastClickRef, onSegmentDoubleClick, clearDragTimeout } = config;
  if (segmentIndex === null) return false;
  const now = Date.now();
  const lastClick = lastClickRef.current;
  const clicked = isDoubleClick(segmentIndex, lastClick, now);
  if (clicked) {
    clearDragTimeout();
    lastClickRef.current = { time: 0, point: null };
    onSegmentDoubleClick(segmentIndex);
    return true;
  }
  lastClickRef.current = { time: now, point: { segment: segmentIndex, point: 0 } };
  return false;
};

type ProcessEraseToolConfig = {
  stagePoint: Point;
  segments: CableSegment[];
  getNearestPoint: (point: Point, threshold?: number) => HoveredPoint | null;
  getNearestSegment: (point: Point, threshold?: number) => number | null;
  mergeSegments: (segmentIndex: number) => void;
  deleteSegment: (segmentIndex: number) => void;
};

// Helper to handle erase tool logic
export const processEraseTool = (config: ProcessEraseToolConfig): boolean => {
  const { stagePoint, segments, getNearestPoint, getNearestSegment, mergeSegments, deleteSegment } = config;
  const nearestPoint = getNearestPoint(stagePoint, 10);
  if (nearestPoint) {
    const segment = segments[nearestPoint.segment];
    const connectedIndex = segment.connectedTo;
    if (connectedIndex !== undefined) {
      const connectedSegment = segments[connectedIndex];
      if (isConnectionPoint(segment, nearestPoint.point, connectedSegment)) {
        mergeSegments(nearestPoint.segment);
        return true;
      }
    }
  }
  const nearestSegmentForErase = getNearestSegment(stagePoint, 10);
  if (nearestSegmentForErase !== null) {
    deleteSegment(nearestSegmentForErase);
    return true;
  }
  return false;
};

type ProcessLineToolConfig = {
  stagePoint: Point;
  selectedSegmentIndex: number | null;
  getNearestSegment: (point: Point, threshold?: number) => number | null;
  getNearestSegmentEndpoint: (point: Point, threshold?: number) => { segmentIndex: number; point: Point; isStart: boolean } | null;
  checkAndHandleDoubleClick: (segmentIndex: number | null) => boolean;
  startDrawing: (point: Point) => void;
  setSelectedSegmentIndex: (value: number | null) => void;
};

// Helper to handle line tool logic
export const processLineTool = (config: ProcessLineToolConfig): void => {
  const { stagePoint, selectedSegmentIndex, getNearestSegment, getNearestSegmentEndpoint, checkAndHandleDoubleClick, startDrawing, setSelectedSegmentIndex } = config;
  if (selectedSegmentIndex !== null) setSelectedSegmentIndex(null);
  const nearestSegment = getNearestSegment(stagePoint, 10);
  if (nearestSegment !== null && checkAndHandleDoubleClick(nearestSegment)) return;
  const nearestEndpoint = getNearestSegmentEndpoint(stagePoint, 15);
  if (nearestEndpoint !== null) {
    startDrawing(nearestEndpoint.point);
    return;
  }
  startDrawing(stagePoint);
};

type ProcessSelectToolConfig = {
  stagePoint: Point;
  selectedSegmentIndices: number[];
  getNearestPoint: (point: Point, threshold?: number) => HoveredPoint | null;
  getNearestSegment: (point: Point, threshold?: number) => number | null;
  handleSelectedSegmentInteraction: (stagePoint: Point, nearestPoint: HoveredPoint | null, nearestSegment: number | null) => boolean;
  checkAndHandleDoubleClick: (segmentIndex: number | null) => boolean;
  setSelectedSegmentIndices: (value: number[]) => void;
  setIsSelecting: (value: boolean) => void;
  setSelectionBox: (value: { start: Point; end: Point } | null) => void;
  setDragStart: (value: Point) => void;
};

// Helper to handle select tool logic
export const processSelectTool = (config: ProcessSelectToolConfig): void => {
  const { stagePoint, selectedSegmentIndices, getNearestPoint, getNearestSegment, handleSelectedSegmentInteraction, checkAndHandleDoubleClick, setSelectedSegmentIndices, setIsSelecting, setSelectionBox, setDragStart } = config;
  const nearestPoint = getNearestPoint(stagePoint, 10);
  const nearestSegment = getNearestSegment(stagePoint, 10);
  
  // Check if clicking on a selected segment
  const hasSelectedSegments = selectedSegmentIndices.length > 0;
  const hasNearestSegment = nearestSegment !== null;
  const nearestSegmentIsSelected = hasNearestSegment && selectedSegmentIndices.includes(nearestSegment);
  const isClickingOnSelected = hasSelectedSegments && nearestSegmentIsSelected;
  if (isClickingOnSelected && handleSelectedSegmentInteraction(stagePoint, nearestPoint, nearestSegment)) {
    return;
  }
  
  // If clicking on a segment, select it (single selection for now, can be extended with modifier keys)
  if (nearestSegment !== null) {
    if (checkAndHandleDoubleClick(nearestSegment)) return;
    setSelectedSegmentIndices([nearestSegment]);
    setDragStart(stagePoint);
    return;
  }
  
  // If clicking on empty space, start selection box
  if (nearestSegment === null) {
    setSelectedSegmentIndices([]);
    setIsSelecting(true);
    setSelectionBox({ start: stagePoint, end: stagePoint });
    setDragStart(stagePoint);
  }
};
