type CanvasStatsProps = {
  totalSegments: number;
  totalLength: number;
};

export function CanvasStats({
  totalSegments,
  totalLength,
}: CanvasStatsProps) {
  return (
    <div className="mt-2 text-gray-300 text-sm">
      <strong>Segments:</strong> {totalSegments} |{" "}
      <strong>Total Length:</strong> {totalLength.toFixed(2)} m
    </div>
  );
}

