import type { Tool } from "../types";

type ToolbarProps = {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
};

export function Toolbar({ activeTool, setActiveTool }: ToolbarProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-2 border border-gray-700 mb-2">
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTool("line")}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm flex items-center gap-2 ${
            activeTool === "line"
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
          }`}
          title="Segment Tool - Draw cable segments"
        >
          <span className="text-lg">📏</span>
          <span>Segment</span>
        </button>
        <button
          onClick={() => setActiveTool("erase")}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm flex items-center gap-2 ${
            activeTool === "erase"
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
          }`}
          title="Erase Tool - Delete segments or cross sections"
        >
          <span className="text-lg">🗑️</span>
          <span>Erase</span>
        </button>
      </div>
    </div>
  );
}

