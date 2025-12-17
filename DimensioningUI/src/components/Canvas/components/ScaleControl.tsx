import React from "react";

type ScaleControlProps = {
  scale: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function ScaleControl({
  scale,
  onIncrement,
  onDecrement,
}: ScaleControlProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-gray-300 font-medium">Scale:</label>
      <div className="flex items-center gap-2 bg-gray-900 border-2 border-gray-700 rounded-lg px-3 py-2">
        <button
          onClick={onDecrement}
          className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded transition-colors cursor-pointer flex items-center justify-center font-bold"
          title="Zoom out (decrease by 10)"
        >
          −
        </button>
        <span className="text-white font-mono min-w-[60px] text-center">
          {scale} px/m
        </span>
        <button
          onClick={onIncrement}
          className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded transition-colors cursor-pointer flex items-center justify-center font-bold"
          title="Zoom in (increase by 10)"
        >
          +
        </button>
      </div>
    </div>
  );
}

