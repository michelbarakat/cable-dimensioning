type CanvasStatsProps = {
  totalSegments: number;
  totalLength: number;
  totalCrossSections: number;
};

export function CanvasStats({
  totalSegments,
  totalLength,
  totalCrossSections,
}: CanvasStatsProps) {
  return (
    <div className="mt-2 text-gray-300 text-sm">
      <strong>Segments:</strong> {totalSegments} |{" "}
      <strong>Cross Sections:</strong> {totalCrossSections} |{" "}
      <strong>Total Length:</strong> {totalLength.toFixed(2)} m
    </div>
  );
}

