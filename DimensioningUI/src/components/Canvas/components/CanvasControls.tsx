type CanvasControlsProps = {
  showGrid: boolean;
  snapToGrid: boolean;
  historyIndex: number;
  historyLength: number;
  setShowGrid: (value: boolean) => void;
  setSnapToGrid: (value: boolean) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleClear: () => void;
};

export function CanvasControls({
  showGrid,
  snapToGrid,
  historyIndex,
  historyLength,
  setShowGrid,
  setSnapToGrid,
  handleUndo,
  handleRedo,
  handleClear,
}: CanvasControlsProps) {
  return (
    <div className="flex justify-between items-center mb-2">
      <label className="text-gray-300 font-medium">Canvas</label>
      <div className="flex gap-2">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm ${
            showGrid
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
          title="Toggle Grid"
        >
          {showGrid ? "⊞ Grid" : "⊞ No Grid"}
        </button>
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm ${
            snapToGrid
              ? "bg-green-600 hover:bg-green-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
          title="Toggle Snap to Grid"
        >
          {snapToGrid ? "⊡ Snap" : "⊡ No Snap"}
        </button>
        <button
          onClick={handleUndo}
          disabled={historyIndex === 0}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer text-sm"
          title="Undo"
        >
          ↶ Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex >= historyLength - 1}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer text-sm"
          title="Redo"
        >
          ↷ Redo
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer text-sm"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
}

