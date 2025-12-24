import type { Tool } from "../types";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Select01Icon,
  Delete01Icon,
  LinerIcon,
  RulerIcon,
} from "@hugeicons-pro/core-stroke-rounded";

type ToolInstructionsProps = {
  activeTool: Tool;
};

export function ToolInstructions({ activeTool }: ToolInstructionsProps) {
  return (
    <p className="text-text-secondary text-sm p-2 flex items-center gap-2">
      {activeTool === "select" ? (
        <>
          <HugeiconsIcon icon={Select01Icon} size={16} className="inline-block" />
          <strong>Selection Tool:</strong> Click to select segments. Drag endpoints to resize, drag body to move. Double-click to edit properties.
        </>
      ) : activeTool === "erase" ? (
        <>
          <HugeiconsIcon icon={Delete01Icon} size={16} className="inline-block" />
          <strong>Erase Tool:</strong> Click to delete segments.
        </>
      ) : activeTool === "calibrate" ? (
        <>
          <HugeiconsIcon icon={RulerIcon} size={16} className="inline-block" />
          <strong>Calibration Tool:</strong> Draw a line on a known distance in the floorplan image. Enter the actual dimension when prompted.
        </>
      ) : (
        <>
          <HugeiconsIcon icon={LinerIcon} size={16} className="inline-block" />
          <strong>Segment Tool:</strong> Click and drag to draw cable
          segments. Double-click a segment to edit its properties. Voltage drop updates in real-time.
        </>
      )}
    </p>
  );
}

