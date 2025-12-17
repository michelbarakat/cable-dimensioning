import { isValidNumberInput, parseNumber } from "../../../lib/numberInput";

type CrossSectionPopoverProps = {
  popover: {
    visible: boolean;
    x: number;
    y: number;
    connectionKey: string;
    value: number;
  } | null;
  crossSectionValues: Map<string, number>;
  setPopover: (
    popover: {
      visible: boolean;
      x: number;
      y: number;
      connectionKey: string;
      value: number;
    } | null
  ) => void;
  setCrossSectionValues: (values: Map<string, number>) => void;
};

export function CrossSectionPopover({
  popover,
  crossSectionValues,
  setPopover,
  setCrossSectionValues,
}: CrossSectionPopoverProps) {
  if (!popover || !popover.visible) return null;

  return (
    <div
      className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 p-3"
      style={{
        left: `${popover.x}px`,
        top: `${popover.y}px`,
        transform: "translateX(-50%)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <label className="text-gray-300 text-xs mb-1 block">
        Cross Section (mm²)
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={popover.value.toString()}
        onChange={(e) => {
          const value = e.target.value;
          if (isValidNumberInput(value)) {
            const numValue = parseNumber(value);
            setPopover({ ...popover, value: numValue });
            const newValues = new Map(crossSectionValues);
            newValues.set(popover.connectionKey, numValue);
            setCrossSectionValues(newValues);
          }
        }}
        className="bg-gray-900 border-2 border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none transition-colors w-24 text-sm"
        autoFocus
      />
      <button
        onClick={() => setPopover(null)}
        className="mt-2 w-full text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors cursor-pointer"
      >
        Close
      </button>
    </div>
  );
}

