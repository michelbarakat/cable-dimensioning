import type { Tool } from "../types";

type ToolbarProps = {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  scale: number;
  onScaleIncrement: () => void;
  onScaleDecrement: () => void;
};

export function Toolbar({ 
  activeTool, 
  setActiveTool, 
  scale, 
  onScaleIncrement, 
  onScaleDecrement 
}: ToolbarProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-2 border border-gray-700 mb-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTool("select")}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm flex items-center gap-2 ${
              activeTool === "select"
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
            title="Selection Tool - Move and resize segments"
          >
            <span className="text-lg">↔️</span>
            <span>Select</span>
          </button>
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
        <div className="flex items-center gap-3">
          <label className="text-gray-300 font-medium text-sm">Scale:</label>
          <div className="flex items-center gap-2 bg-gray-900 border-2 border-gray-700 rounded-lg px-3 py-2">
            <button
              onClick={onScaleDecrement}
              className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded transition-colors cursor-pointer flex items-center justify-center font-bold"
              title="Zoom out (decrease by 10)"
            >
              −
            </button>
            <span className="text-white font-mono min-w-[60px] text-center text-sm">
              {scale} px/m
            </span>
            <button
              onClick={onScaleIncrement}
              className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded transition-colors cursor-pointer flex items-center justify-center font-bold"
              title="Zoom in (increase by 10)"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

