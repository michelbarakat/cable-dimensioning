import type { Tool } from "../types";

type ToolInstructionsProps = {
  activeTool: Tool;
};

export function ToolInstructions({ activeTool }: ToolInstructionsProps) {
  return (
    <p className="text-gray-400 text-sm mt-2">
      {activeTool === "erase" ? (
        <>
          🗑️ <strong>Erase Tool:</strong> Hover over elements to see tooltips.
          Click to delete segments or cross sections.
        </>
      ) : activeTool === "crossSection" ? (
        <>
          ✂️ <strong>Cross-Section Tool:</strong> Click on a line to split it
          into two segments.
        </>
      ) : (
        <>
          📏 <strong>Segment Tool:</strong> Click and drag to draw cable
          segments. Voltage drop updates in real-time.
        </>
      )}
    </p>
  );
}

