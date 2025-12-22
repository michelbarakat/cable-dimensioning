import { useCallback, useRef, useMemo } from "react";
import type { Point, HoveredPoint } from "../types";
import { snapToGridPoint } from "../utils";
import { processSelectedSegmentInteraction, createToolHandlers, createDragHandlers, createPanningHandler, createDrawingStarter, createDoubleClickHandler, createEraseToolHandler, createLineToolHandler, createSelectToolHandler } from "./toolHandlerHelpers";
import type { UseMouseHandlersProps } from "./types";

export function useMouseHandlers({
  segments,
  activeTool,
  isSpacePressed,
  stagePosition,
  scale,
  snapToGrid,
  popover,
  getNearestPoint,
  getNearestSegment,
  getNearestSegmentEndpoint,
  selectedSegmentIndices,
  deleteSegment,
  mergeSegments,
  setIsPanning,
  setPanStart,
  setIsDraggingPoint,
  setIsDraggingSegment,
  setSelectedSegmentIndices,
  setIsSelecting,
  setSelectionBox,
  setHoveredPointIndex,
  setDragStart,
  setIsDrawing,
  setCurrentSegment,
  setPopover,
  onSegmentDoubleClick,
}: UseMouseHandlersProps) {
  const lastClickRef = useRef<{ time: number; point: HoveredPoint | null }>({
    time: 0,
    point: null,
  });
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const snapPoint = useCallback((point: Point): Point => snapToGridPoint(point, scale, snapToGrid), [scale, snapToGrid]);

  const clearDragTimeout = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
  }, []);

  const checkAndHandleDoubleClick = useMemo(() => createDoubleClickHandler({ lastClickRef, onSegmentDoubleClick, clearDragTimeout }), [onSegmentDoubleClick, clearDragTimeout]);
  const handleEraseTool = useMemo(() => createEraseToolHandler({ segments, getNearestPoint, getNearestSegment, mergeSegments, deleteSegment }), [getNearestPoint, getNearestSegment, segments, mergeSegments, deleteSegment]);

  const dragHandlers = useMemo(() => createDragHandlers(setIsDraggingPoint, setHoveredPointIndex, setDragStart, setIsDraggingSegment), [setIsDraggingPoint, setHoveredPointIndex, setDragStart, setIsDraggingSegment]);
  const handlePointDrag = dragHandlers.pointDrag;
  const handleSegmentBodyDrag = dragHandlers.bodyDrag;

  const handleSelectedSegmentInteraction = useCallback(
    (stagePoint: Point, nearestPoint: HoveredPoint | null, nearestSegment: number | null): boolean =>
      processSelectedSegmentInteraction({
        stagePoint, nearestPoint, nearestSegment, selectedSegmentIndices,
        checkDoubleClick: checkAndHandleDoubleClick,
        onPointDrag: handlePointDrag, onBodyDrag: handleSegmentBodyDrag,
        onDeselect: () => setSelectedSegmentIndices([]),
      }),
    [selectedSegmentIndices, checkAndHandleDoubleClick, handlePointDrag, handleSegmentBodyDrag, setSelectedSegmentIndices]
  );

  const startDrawing = useMemo(() => createDrawingStarter(setIsDrawing, setCurrentSegment, snapPoint), [snapPoint, setIsDrawing, setCurrentSegment]);
  const handlePanning = useMemo(() => createPanningHandler(setIsPanning, setPanStart, stagePosition, popover, setPopover), [stagePosition, popover, setIsPanning, setPanStart, setPopover]);

  const handleLineTool = useMemo(() => createLineToolHandler({ selectedSegmentIndex: selectedSegmentIndices.length > 0 ? selectedSegmentIndices[0] : null, getNearestSegment, getNearestSegmentEndpoint, checkAndHandleDoubleClick, startDrawing, setSelectedSegmentIndex: (idx) => setSelectedSegmentIndices(idx !== null ? [idx] : []) }), [selectedSegmentIndices, getNearestSegment, getNearestSegmentEndpoint, checkAndHandleDoubleClick, startDrawing, setSelectedSegmentIndices]);
  const handleSelectTool = useMemo(() => createSelectToolHandler({ selectedSegmentIndices, getNearestPoint, getNearestSegment, handleSelectedSegmentInteraction, checkAndHandleDoubleClick, setSelectedSegmentIndices, setIsSelecting, setSelectionBox, setDragStart }), [selectedSegmentIndices, getNearestPoint, getNearestSegment, handleSelectedSegmentInteraction, checkAndHandleDoubleClick, setSelectedSegmentIndices, setIsSelecting, setSelectionBox, setDragStart]);

  const executeToolAction = useCallback((stagePoint: Point) => {
    const handlers = createToolHandlers({ erase: handleEraseTool, line: handleLineTool, select: handleSelectTool });
    // Close popover if visible, but still execute the tool action
    if (popover?.visible) {
      setPopover(null);
    }
    handlers[activeTool]?.(stagePoint);
  }, [popover, setPopover, activeTool, handleEraseTool, handleLineTool, handleSelectTool]);

  const handleMouseDown = useCallback((e: any) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const stagePoint = { x: point.x - stagePosition.x, y: point.y - stagePosition.y };
    isSpacePressed ? handlePanning(point) : executeToolAction(stagePoint);
  }, [isSpacePressed, stagePosition, handlePanning, executeToolAction]);

  return {
    handleMouseDown,
    dragTimeoutRef,
  };
}

