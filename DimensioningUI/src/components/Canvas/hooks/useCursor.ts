import type { Tool } from "../types";
import type { HoveredPoint } from "../types";

export function useCursor(
  isSpacePressed: boolean,
  isPanning: boolean,
  isDraggingSegment: boolean,
  isDraggingPoint: boolean,
  activeTool: Tool,
  hoveredDeletable: "segment" | "crossSection" | null,
  hoveredPointIndex: HoveredPoint | null,
  hoveredSegmentIndex: number | null,
  isDrawing: boolean,
  cableEngine: unknown
): string {
  if (isSpacePressed || isPanning) return "grab";
  if (isDraggingSegment || isDraggingPoint) return "grabbing";
  if (activeTool === "erase") {
    // Show pointer cursor when hovering over deletable items
    if (hoveredDeletable !== null) return "pointer";
    return "not-allowed";
  }
  if (activeTool === "calibrate") return "crosshair";
  if (activeTool === "crossSection") return "crosshair";
  if (hoveredPointIndex !== null) {
    // Show crosshair for endpoints when select tool is active
    if (activeTool === "select") return "crosshair";
    // Show crosshair for endpoints when line tool is active (for drawing from endpoints)
    if (activeTool === "line") return "crosshair";
    return "default";
  }
  if (hoveredSegmentIndex !== null) {
    // Show move cursor only when select tool is active
    if (activeTool === "select") return "move";
    // Show crosshair when line tool is active (for drawing)
    if (activeTool === "line") return "crosshair";
    return "default";
  }
  if (isDrawing) return "crosshair";

  // Show crosshair when ready to draw (not hovering over anything) - only for line tool
  const isNotHovering =
    hoveredPointIndex === null && hoveredSegmentIndex === null;
  if (cableEngine && isNotHovering && activeTool === "line")
    return "crosshair";

  // For select tool, show default cursor when not hovering
  if (activeTool === "select") return "default";

  return "default";
}

