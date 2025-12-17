type TooltipProps = {
  tooltip: {
    text: string;
    x: number;
    y: number;
  } | null;
};

export function Tooltip({ tooltip }: TooltipProps) {
  if (!tooltip) return null;

  return (
    <div
      className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-50"
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
        transform: "translateX(-50%)",
      }}
    >
      {tooltip.text}
    </div>
  );
}

