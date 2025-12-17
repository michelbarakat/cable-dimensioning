type ResultBoxProps = {
  result: number | null;
};

export function ResultBox({ result }: ResultBoxProps) {
  const getBoxClasses = () => {
    if (result === null) return "bg-gray-900/50 border-gray-700";
    if (result >= 0) return "bg-gray-900 border-gray-700";
    return "bg-red-900/30 border-red-700";
  };

  const renderContent = () => {
    if (result === null) {
      return (
        <p className="text-gray-500 text-sm">
          <strong className="text-gray-400">Total Voltage Drop: </strong>—
        </p>
      );
    }
    if (result >= 0) {
      return (
        <p className="text-white">
          <strong className="text-blue-400">Total Voltage Drop: </strong>
          <span className="text-xl font-semibold">
            {result.toFixed(6)} Volts
          </span>
        </p>
      );
    }
    return (
      <p className="text-red-300">
        <strong>Error: </strong>Invalid input
      </p>
    );
  };

  return (
    <div
      className={`h-[56px] flex items-center p-3 rounded-lg border whitespace-nowrap ${getBoxClasses()}`}
    >
      {renderContent()}
    </div>
  );
}

