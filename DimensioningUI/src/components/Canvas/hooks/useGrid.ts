import { parseNumber } from "../../../lib/numberInput";

export function useGrid(
  showGrid: boolean,
  scale: string,
  stageSize: { width: number; height: number },
  stagePosition: { x: number; y: number }
) {
  const generateGridLines = () => {
    if (!showGrid) return [];
    const scaleValue = parseNumber(scale);
    if (scaleValue <= 0) return [];

    const gridSize = scaleValue * 0.1; // 0.1m grid
    const stageWidth = stageSize.width;
    const stageHeight = stageSize.height;
    const lines: Array<{ points: number[]; key: string }> = [];

    // Calculate visible area accounting for pan
    const visibleLeft = -stagePosition.x;
    const visibleRight = -stagePosition.x + stageWidth;
    const visibleTop = -stagePosition.y;
    const visibleBottom = -stagePosition.y + stageHeight;

    // Add buffer to ensure grid extends beyond visible area
    const buffer = gridSize * 2;
    const startX = Math.floor((visibleLeft - buffer) / gridSize) * gridSize;
    const endX = Math.ceil((visibleRight + buffer) / gridSize) * gridSize;
    const startY = Math.floor((visibleTop - buffer) / gridSize) * gridSize;
    const endY = Math.ceil((visibleBottom + buffer) / gridSize) * gridSize;

    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      lines.push({
        points: [x, startY, x, endY],
        key: `v-${x}`,
      });
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      lines.push({
        points: [startX, y, endX, y],
        key: `h-${y}`,
      });
    }

    return lines;
  };

  return generateGridLines();
}

