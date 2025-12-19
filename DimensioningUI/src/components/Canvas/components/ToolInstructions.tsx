import type { Tool } from "../types";

type ToolInstructionsProps = {
  activeTool: Tool;
};

export function ToolInstructions({ activeTool }: ToolInstructionsProps) {
  return (
    <p className="text-gray-400 text-sm mt-2">
      {activeTool === "select" ? (
        <>
          ↔️ <strong>Selection Tool:</strong> Click to select segments. Drag endpoints to resize, drag body to move. Double-click to edit properties.
        </>
      ) : activeTool === "erase" ? (
        <>
          🗑️ <strong>Erase Tool:</strong> Click to delete segments.
        </>
      ) : (
        <>
          📏 <strong>Segment Tool:</strong> Click and drag to draw cable
          segments. Double-click a segment to edit its properties. Voltage drop updates in real-time.
        </>
      )}
    </p>
  );
}

