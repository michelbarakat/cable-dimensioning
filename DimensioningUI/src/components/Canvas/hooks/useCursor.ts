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
  if (activeTool === "crossSection") return "crosshair";
  if (hoveredPointIndex !== null) return "crosshair";
  if (hoveredSegmentIndex !== null) return "move";
  if (isDrawing) return "crosshair";

  // Show crosshair when ready to draw (not hovering over anything)
  const isNotHovering =
    hoveredPointIndex === null && hoveredSegmentIndex === null;
  if (cableEngine && isNotHovering && activeTool === "line")
    return "crosshair";

  return "default";
}

