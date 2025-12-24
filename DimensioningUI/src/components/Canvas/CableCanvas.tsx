import { useState, useRef, useCallback, useEffect } from "react";
import { type CableEngine } from "../../lib/cable_dimensioning";
import type {
  CableSegment,
  Point,
  Tool,
  HoveredPoint,
  TemperaturePreset,
} from "./types";
import { MIN_SCALE, MAX_SCALE } from "./constants";
import { InputFields } from "./components/InputFields";
import { Toolbar } from "./components/Toolbar";
import { CanvasStage } from "./components/CanvasStage";
import { Tooltip } from "./components/Tooltip";
import { SegmentPropertiesPopover } from "./components/SegmentPropertiesPopover";
import { ToolInstructions } from "./components/ToolInstructions";
import { LoadingWarning } from "./components/LoadingWarning";
import { Section } from "@core/ui-headless";
import { useVoltageDrop } from "./hooks/useVoltageDrop";
import { useGrid } from "./hooks/useGrid";
import { useCursor } from "./hooks/useCursor";
import { useCanvasDetection } from "./hooks/useCanvasDetection";
import { useSegmentOperations } from "./hooks/useSegmentOperations";
import { useMouseHandlers } from "./hooks/useMouseHandlers";
import {
  calculateSegmentLength,
  snapToGridPoint,
  isConnectionPoint,
  segmentIntersectsRect,
} from "./utils";
import { DEFAULTS } from "../../lib/defaults";

const CableCanvas = ({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) => {
  const [current, setCurrent] = useState<string>(DEFAULTS.CURRENT);
  const [scale, setScale] = useState<number>(DEFAULTS.SCALE);
  const [isThreePhase, setIsThreePhase] = useState<boolean>(false);
  const [baseScale, setBaseScale] = useState<number>(DEFAULTS.SCALE); // Scale at which segments were created
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentSegment, setCurrentSegment] = useState<Point[]>([]);
  const [segments, setSegments] = useState<CableSegment[]>([]);
  const [history, setHistory] = useState<CableSegment[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedSegmentIndices, setSelectedSegmentIndices] = useState<
    number[]
  >([]);
  const [selectionBox, setSelectionBox] = useState<{
    start: Point;
    end: Point;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(
    null
  );
  const [hoveredPointIndex, setHoveredPointIndex] =
    useState<HoveredPoint | null>(null);
  const [isDraggingSegment, setIsDraggingSegment] = useState(false);
  const [isDraggingPoint, setIsDraggingPoint] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 500 });
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredDeletable, setHoveredDeletable] = useState<"segment" | null>(
    null
  );
  const [popover, setPopover] = useState<{
    visible: boolean;
    x: number;
    y: number;
    segmentIndex: number;
    crossSection: string;
    isCopper: boolean;
    temperature: TemperaturePreset;
  } | null>(null);
  const [floorplanImage, setFloorplanImage] = useState<HTMLImageElement | null>(null);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const doubleClickRef = useRef<boolean>(false);
  const doubleClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use hooks
  const result = useVoltageDrop({
    cableEngine,
    segments,
    currentSegment,
    current,
    scale: scale.toString(),
    isThreePhase,
  });

  const gridLines = useGrid(
    showGrid,
    scale.toString(),
    stageSize,
    stagePosition
  );
  const cursor = useCursor(
    isSpacePressed,
    isPanning,
    isDraggingSegment,
    isDraggingPoint,
    activeTool,
    hoveredDeletable,
    hoveredPointIndex,
    hoveredSegmentIndex,
    isDrawing,
    cableEngine
  );

  const { getNearestPoint, getNearestSegment, getNearestSegmentEndpoint } =
    useCanvasDetection(segments);

  const saveToHistory = useCallback(
    (newSegments: CableSegment[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...newSegments]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const { mergeSegments, deleteSegment: deleteSegmentInternal } =
    useSegmentOperations(
      segments,
      scale.toString(),
      snapToGrid,
      setSegments,
      saveToHistory
    );

  const deleteSegment = useCallback(
    (segmentIndex: number): void => {
      deleteSegmentInternal(segmentIndex);

      // Update selected segments array - remove deleted segment and adjust indices
      setSelectedSegmentIndices((prev) => {
        const filtered = prev.filter((idx) => idx !== segmentIndex);
        return filtered.map((idx) => (idx > segmentIndex ? idx - 1 : idx));
      });

      if (hoveredSegmentIndex !== null) {
        if (hoveredSegmentIndex === segmentIndex) {
          setHoveredSegmentIndex(null);
        } else if (hoveredSegmentIndex > segmentIndex) {
          setHoveredSegmentIndex(hoveredSegmentIndex - 1);
        }
      }

      // Close popover if it was open for the deleted segment
      if (popover?.segmentIndex === segmentIndex) {
        setPopover(null);
      } else if (
        popover?.segmentIndex !== undefined &&
        popover.segmentIndex > segmentIndex
      ) {
        // Adjust popover segment index if needed
        setPopover({
          ...popover,
          segmentIndex: popover.segmentIndex - 1,
        });
      }
    },
    [
      deleteSegmentInternal,
      hoveredSegmentIndex,
      popover,
      setHoveredSegmentIndex,
      setPopover,
    ]
  );

  const deleteSelectedSegments = useCallback(() => {
    if (selectedSegmentIndices.length === 0) return;

    // Delete all selected segments at once by filtering them out
    const indicesSet = new Set(selectedSegmentIndices);
    const newSegments = segments.filter((_, index) => !indicesSet.has(index));
    setSegments(newSegments);
    saveToHistory(newSegments);

    // Clear selection and popover
    setSelectedSegmentIndices([]);
    setPopover(null);

    // Clear hover state if needed
    if (hoveredSegmentIndex !== null && indicesSet.has(hoveredSegmentIndex)) {
      setHoveredSegmentIndex(null);
    }
  }, [
    selectedSegmentIndices,
    segments,
    setSegments,
    saveToHistory,
    hoveredSegmentIndex,
    setHoveredSegmentIndex,
  ]);

  const handleSegmentDoubleClick = (segmentIndex: number) => {
    if (!cableEngine || activeTool === "erase") return;
    const segment = segments[segmentIndex];

    // Mark that a double-click just happened to prevent click handler from closing popover
    if (doubleClickTimeoutRef.current) {
      clearTimeout(doubleClickTimeoutRef.current);
    }
    doubleClickRef.current = true;
    doubleClickTimeoutRef.current = setTimeout(() => {
      doubleClickRef.current = false;
      doubleClickTimeoutRef.current = null;
    }, 300);

    // Calculate center position relative to the canvas container
    let centerX = 0;
    let centerY = 0;
    if (containerRef.current) {
      centerX = containerRef.current.clientWidth / 2;
      centerY = containerRef.current.clientHeight / 2;
    }

    setPopover({
      visible: true,
      x: centerX,
      y: centerY,
      segmentIndex,
      crossSection: (segment.crossSection ?? DEFAULTS.CROSS_SECTION).toString(),
      isCopper: segment.isCopper ?? DEFAULTS.IS_COPPER,
      temperature: segment.temperature ?? DEFAULTS.TEMPERATURE,
    });
  };

  const handleUpdateSegment = useCallback(
    (
      segmentIndex: number,
      crossSection: number,
      isCopper: boolean,
      temperature: TemperaturePreset
    ) => {
      // Validate segment index exists before updating
      if (segmentIndex < 0 || segmentIndex >= segments.length) {
        console.warn(
          `Cannot update segment at index ${segmentIndex}: segment does not exist`
        );
        return;
      }

      const newSegments = [...segments];
      newSegments[segmentIndex] = {
        ...newSegments[segmentIndex],
        crossSection,
        isCopper,
        temperature,
      };
      setSegments(newSegments);
      saveToHistory(newSegments);
    },
    [segments, setSegments, saveToHistory]
  );

  // Update stage size based on container dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setStageSize({ width, height });
      }
    };

    updateSize();
    
    // Use ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener("resize", updateSize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Helper function to check if target is an editable input element
  const isEditableElement = (target: HTMLElement): boolean => {
    return (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    );
  };

  // Helper function to check if popover should handle the key event
  const shouldPopoverHandleKey = (isPopoverVisible: boolean, key: string): boolean => {
    return isPopoverVisible && key !== "Escape";
  };

  // Helper function to check if key is a delete key
  const isDeleteKey = (key: string): boolean => {
    return key === "Delete" || key === "Backspace" || key === "Enter" || key === "Return";
  };

  // Helper function to check if keyboard event should be ignored
  const shouldIgnoreKeyEvent = (target: HTMLElement, isPopoverVisible: boolean, key: string): boolean => {
    return isEditableElement(target) || shouldPopoverHandleKey(isPopoverVisible, key);
  };

  // Handler for Space key
  const handleSpaceKey = useCallback((e: KeyboardEvent): boolean => {
    if (e.code === "Space" && !e.repeat) {
      setIsSpacePressed(true);
      e.preventDefault();
      return true;
    }
    return false;
  }, []);

  // Handler for delete keys on selected segments
  const handleDeleteKey = useCallback((e: KeyboardEvent): boolean => {
    if (isDeleteKey(e.key) && selectedSegmentIndices.length > 0) {
      e.preventDefault();
      deleteSelectedSegments();
      return true;
    }
    return false;
  }, [selectedSegmentIndices, deleteSelectedSegments]);

  // Handle keyboard events for space key and delete/backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (shouldIgnoreKeyEvent(target, popover?.visible ?? false, e.key)) {
        return;
      }

      handleSpaceKey(e) || handleDeleteKey(e);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedSegmentIndices, activeTool, deleteSelectedSegments, popover]);

  const { handleMouseDown, dragTimeoutRef } = useMouseHandlers({
    cableEngine,
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
    onSegmentDoubleClick: handleSegmentDoubleClick,
  });

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef?.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      if (doubleClickTimeoutRef.current) {
        clearTimeout(doubleClickTimeoutRef.current);
      }
    };
  }, [dragTimeoutRef]);

  const handlePanMove = (point: Point) => {
    const newX = point.x - panStart.x;
    const newY = point.y - panStart.y;
    setStagePosition({ x: newX, y: newY });
  };

  const handlePointDrag = (stagePoint: Point) => {
    if (selectedSegmentIndices.length === 0 || hoveredPointIndex === null)
      return;
    // For point dragging, use the first selected segment (resize only one at a time)
    const selectedSegmentIndex = selectedSegmentIndices[0];
    if (hoveredPointIndex.segment !== selectedSegmentIndex) return;

    const snappedPoint = snapToGridPoint(stagePoint, scale, snapToGrid);
    const newSegments = [...segments];
    const seg = newSegments[selectedSegmentIndex];
    const pointIndex = hoveredPointIndex.point;
    const originalPoint = seg.points[pointIndex];

    // Update the point in the current segment
    const newPoints = [...seg.points];
    newPoints[pointIndex] = snappedPoint;
    const newLength = calculateSegmentLength(newPoints, scale);
    newSegments[selectedSegmentIndex] = {
      points: newPoints,
      length: newLength,
    };

    // If this is a cross-section point (shared between connected segments), update the connected segment too
    if (seg.connectedTo !== undefined) {
      const connectedIndex = seg.connectedTo;
      const connectedSeg = newSegments[connectedIndex];

      // Find the corresponding point in the connected segment by matching coordinates
      let connectedPointIndex: number | null = null;
      for (let i = 0; i < connectedSeg.points.length; i++) {
        const p = connectedSeg.points[i];
        // Check if this point matches the original point position (before dragging)
        if (
          Math.abs(originalPoint.x - p.x) < 1 &&
          Math.abs(originalPoint.y - p.y) < 1
        ) {
          connectedPointIndex = i;
          break;
        }
      }

      if (connectedPointIndex !== null) {
        const connectedNewPoints = [...connectedSeg.points];
        connectedNewPoints[connectedPointIndex] = snappedPoint;
        const connectedNewLength = calculateSegmentLength(
          connectedNewPoints,
          scale
        );
        newSegments[connectedIndex] = {
          ...connectedSeg,
          points: connectedNewPoints,
          length: connectedNewLength,
        };
      }
    }

    setSegments(newSegments);
    // Don't save to history during dragging - only on mouse up
  };

  const handleSegmentDrag = (stagePoint: Point) => {
    if (selectedSegmentIndices.length === 0) return;

    // Snap the current mouse position if snapping is enabled
    const snappedStagePoint = snapToGrid
      ? snapToGridPoint(stagePoint, scale, snapToGrid)
      : stagePoint;

    const dx = snappedStagePoint.x - dragStart.x;
    const dy = snappedStagePoint.y - dragStart.y;
    const newSegments = [...segments];

    // Move all selected segments
    selectedSegmentIndices.forEach((segmentIndex) => {
      const seg = newSegments[segmentIndex];
      const newPoints = seg.points.map((p) => {
        const movedPoint = {
          x: p.x + dx,
          y: p.y + dy,
        };
        // Snap to grid if enabled, otherwise move freely
        return snapToGrid
          ? snapToGridPoint(movedPoint, scale, snapToGrid)
          : movedPoint;
      });
      const newLength = calculateSegmentLength(newPoints, scale);
      newSegments[segmentIndex] = {
        ...seg,
        points: newPoints,
        length: newLength,
      };
    });

    setSegments(newSegments);
    // Update dragStart to snapped position to maintain consistent delta calculation
    setDragStart(snappedStagePoint);
    // Don't save to history during dragging - only on mouse up
  };

  const updateHoverStates = (stagePoint: Point) => {
    const nearestPoint = getNearestPoint(stagePoint, 10);
    if (nearestPoint !== null) {
      setHoveredPointIndex(nearestPoint);
      setHoveredSegmentIndex(null);
    } else {
      setHoveredPointIndex(null);
      const nearestSegment = getNearestSegment(stagePoint, 10);
      setHoveredSegmentIndex(nearestSegment);
    }
  };

  const handleEraseToolMove = (stagePoint: Point) => {
    const nearestPoint = getNearestPoint(stagePoint, 10);

    // Check if hovering over a connection point (cross-section)
    if (nearestPoint !== null) {
      const segment = segments[nearestPoint.segment];
      const hasConnection = segment.connectedTo !== undefined;

      if (hasConnection) {
        const connectedIndex = segment.connectedTo!;
        const connectedSegment = segments[connectedIndex];
        const pointIndex = nearestPoint.point;
        const isConnPoint = isConnectionPoint(
          segment,
          pointIndex,
          connectedSegment
        );

        if (isConnPoint) {
          const canvasPoint = segment.points[pointIndex];
          setTooltip({
            text: "Click to merge segments",
            x: canvasPoint.x + stagePosition.x,
            y: canvasPoint.y + stagePosition.y - 20,
          });
          setHoveredDeletable("segment");
          return;
        }
      }
    }

    // Check if hovering over a segment
    const nearestSegment = getNearestSegment(stagePoint, 10);
    if (nearestSegment !== null) {
      const seg = segments[nearestSegment];
      const midPoint = {
        x: (seg.points[0].x + seg.points[seg.points.length - 1].x) / 2,
        y: (seg.points[0].y + seg.points[seg.points.length - 1].y) / 2,
      };
      setTooltip({
        text: "Delete segment",
        x: midPoint.x + stagePosition.x,
        y: midPoint.y + stagePosition.y - 20,
      });
      setHoveredDeletable("segment");
      return;
    }

    // Nothing hovered
    setTooltip(null);
    setHoveredDeletable(null);
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const stagePoint = {
      x: point.x - stagePosition.x,
      y: point.y - stagePosition.y,
    };

    // Handle panning
    if (isPanning) {
      handlePanMove(point);
      return;
    }

    // Handle dragging a point (resize)
    if (isDraggingPoint) {
      handlePointDrag(stagePoint);
      return;
    }

    // Handle dragging a segment (move)
    if (isDraggingSegment) {
      handleSegmentDrag(stagePoint);
      return;
    }

    // Handle selection box dragging
    if (isSelecting && selectionBox) {
      setSelectionBox({ ...selectionBox, end: stagePoint });
      return;
    }

    // Handle erase tool tooltips
    if (activeTool === "erase") {
      handleEraseToolMove(stagePoint);
      return;
    }

    // Update hover states for cursor feedback
    updateHoverStates(stagePoint);
    setTooltip(null);
    setHoveredDeletable(null);

    // Handle drawing
    if (!isDrawing) return;
    const snappedPoint = snapToGridPoint(stagePoint, scale, snapToGrid);
    // Update only the end point to create a straight line
    setCurrentSegment((prev) => {
      if (prev.length === 0) return [snappedPoint];
      return [prev[0], snappedPoint]; // Keep start point, update end point
    });
  };

  const handleDragEnd = () => {
    // Clear drag timeout if mouse is released before timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }

    // Handle selection box completion
    if (isSelecting && selectionBox) {
      // Find segments within selection box
      const selectedIndices: number[] = [];
      segments.forEach((segment, index) => {
        if (segmentIntersectsRect(segment, selectionBox)) {
          selectedIndices.push(index);
        }
      });
      setSelectedSegmentIndices(selectedIndices);
      setSelectionBox(null);
      setIsSelecting(false);
    }

    if (isDraggingPoint) {
      saveToHistory(segments);
      setIsDraggingPoint(false);
      setHoveredPointIndex(null);
      // Keep segments selected after dragging
      return true;
    }

    if (isDraggingSegment) {
      saveToHistory(segments);
      setIsDraggingSegment(false);
      // Keep segments selected after dragging
      return true;
    }

    return false;
  };

  const handleDrawingComplete = () => {
    if (!isDrawing || currentSegment.length < 2) {
      setIsDrawing(false);
      setCurrentSegment([]);
      return;
    }

    const length = calculateSegmentLength(currentSegment, scale);
    if (length <= 0) {
      setIsDrawing(false);
      setCurrentSegment([]);
      return;
    }

    // Update base scale if this is the first segment or scale has changed significantly
    if (segments.length === 0 || Math.abs(scale - baseScale) > 1) {
      setBaseScale(scale);
    }

    const newSegments = [
      ...segments,
      {
        points: [...currentSegment],
        length,
        crossSection: DEFAULTS.CROSS_SECTION,
        isCopper: DEFAULTS.IS_COPPER,
        temperature: DEFAULTS.TEMPERATURE,
      },
    ];
    setSegments(newSegments);
    saveToHistory(newSegments);
    setIsDrawing(false);
    setCurrentSegment([]);
    // calculateVoltageDrop will be called by useEffect
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (handleDragEnd()) {
      return;
    }

    // Clear selection box if we were selecting but didn't complete it
    if (isSelecting) {
      setIsSelecting(false);
      setSelectionBox(null);
    }

    handleDrawingComplete();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSegments([...history[newIndex]]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSegments([...history[newIndex]]);
    }
  };

  const handleClear = () => {
    setSegments([]);
    setCurrentSegment([]);
    setHistory([[]]);
    setHistoryIndex(0);
  };

  const handleFloorplanUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setFloorplanImage(img);
      };
      img.onerror = () => {
        console.error("Failed to load image");
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      console.error("Failed to read file");
    };
    reader.readAsDataURL(file);
  }, []);

  // Helper function to zoom towards a focal point
  const zoomTowardsPoint = useCallback(
    (focalPoint: Point, newScale: number) => {
      const oldScale = scale;
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      if (clampedScale === oldScale) return;

      const scaleFactor = clampedScale / oldScale;

      setStagePosition((prev) => ({
        x: focalPoint.x - (focalPoint.x - prev.x) * scaleFactor,
        y: focalPoint.y - (focalPoint.y - prev.y) * scaleFactor,
      }));
      setScale(clampedScale);
    },
    [scale]
  );

  // Scale control handlers (increment/decrement by 10) - zoom to center
  const handleScaleIncrement = () => {
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    zoomTowardsPoint({ x: centerX, y: centerY }, scale + 10);
  };

  const handleScaleDecrement = () => {
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    zoomTowardsPoint({ x: centerX, y: centerY }, scale - 10);
  };

  // Handle scroll wheel for zooming (with Cmd/Ctrl) or panning (regular scroll)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Only handle when hovering over the canvas container
      if (!containerRef.current?.contains(e.target as Node)) return;

      // Check for Cmd (Mac) or Ctrl (other platforms)
      const isModifierPressed = e.metaKey || e.ctrlKey;

      if (isModifierPressed) {
        // Zoom with modifier key - zoom towards mouse cursor position
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;

        // Get mouse position relative to the container
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        zoomTowardsPoint({ x: mouseX, y: mouseY }, scale + delta);
      } else {
        // Pan with regular scroll (vertical scrolling)
        e.preventDefault();
        const panDelta = -e.deltaY; // Reverse direction so scrolling down moves canvas down
        setStagePosition((prev) => ({
          x: prev.x,
          y: prev.y + panDelta,
        }));
      }
    },
    [scale, zoomTowardsPoint]
  );

  // Attach scroll wheel handler to container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  const currentPoints = currentSegment.length > 0 ? currentSegment : [];

  // Calculate total segments and length including current segment being drawn
  const totalSegments = segments.length + (currentSegment.length >= 2 ? 1 : 0);
  const totalLength = (() => {
    const completedLength = segments.reduce((sum, seg) => sum + seg.length, 0);
    const currentLength =
      currentSegment.length >= 2
        ? calculateSegmentLength(currentSegment, scale)
        : 0;
    return completedLength + currentLength;
  })();

  return (
    <Section title="Cable Simulation Canvas">
      <div className="flex flex-col gap-3 p-2 h-full">
        <LoadingWarning cableEngine={cableEngine} />

        <InputFields
          current={current}
          isThreePhase={isThreePhase}
          setCurrent={setCurrent}
          setIsThreePhase={setIsThreePhase}
          result={result}
          totalSegments={totalSegments}
          totalLength={totalLength}
        />

        <div className="bg-surface rounded-sm border border-section-border divide-y divide-section-border flex flex-col" style={{ height: "calc(100vh - 252px)" }}>
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            scale={scale}
            onScaleIncrement={handleScaleIncrement}
            onScaleDecrement={handleScaleDecrement}
            setScale={setScale}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            historyIndex={historyIndex}
            historyLength={history.length}
            setShowGrid={setShowGrid}
            setSnapToGrid={setSnapToGrid}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            handleClear={handleClear}
            onFloorplanUpload={handleFloorplanUpload}
          />
          <div
            ref={containerRef}
            className="relative overflow-visible flex-1 min-h-50"
            onClick={(e) => {
              // Close popover when clicking outside of it
              // But don't close if it's a double-click (handled separately)
              if (
                popover?.visible &&
                !doubleClickRef.current &&
                !(e.target as HTMLElement).closest("[data-popover]")
              ) {
                setPopover(null);
              }
            }}
          >
            <CanvasStage
              stageSize={stageSize}
              stagePosition={stagePosition}
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
              onSegmentDoubleClick={handleSegmentDoubleClick}
              handleMouseDown={handleMouseDown}
              handleMouseMove={handleMouseMove}
              handleMouseUp={handleMouseUp}
              stageRef={stageRef}
              cursor={cursor}
              floorplanImage={floorplanImage}
            />
            <Tooltip tooltip={tooltip} />
            <SegmentPropertiesPopover
              popover={popover}
              setPopover={setPopover}
              onUpdateSegment={handleUpdateSegment}
              cableEngine={cableEngine}
              current={current}
              segmentsCount={segments.length}
            />
          </div>
          <ToolInstructions activeTool={activeTool} />
        </div>
      </div>
    </Section>
  );
};

export default CableCanvas;
