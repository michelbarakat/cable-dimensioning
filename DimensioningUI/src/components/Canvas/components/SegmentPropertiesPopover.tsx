import { useEffect } from "react";
import { isValidNumberInput, parseNumber } from "../../../lib/numberInput";
import { DEFAULTS } from "../../../lib/defaults";
import { RANGES } from "../../../lib/ranges";

type SegmentPropertiesPopoverProps = {
  popover: {
    visible: boolean;
    x: number;
    y: number;
    segmentIndex: number;
    crossSection: string; // Store as string to allow intermediate states like "2."
    isCopper: boolean;
  } | null;
  setPopover: (
    popover: {
      visible: boolean;
      x: number;
      y: number;
      segmentIndex: number;
      crossSection: string;
      isCopper: boolean;
    } | null
  ) => void;
  onUpdateSegment: (segmentIndex: number, crossSection: number, isCopper: boolean) => void;
};

export function SegmentPropertiesPopover({
  popover,
  setPopover,
  onUpdateSegment,
}: SegmentPropertiesPopoverProps) {
  // Handle ESC key to close popover - must be called before early return
  useEffect(() => {
    if (!popover?.visible) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPopover(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [popover?.visible, setPopover]);

  if (!popover || !popover.visible) return null;

  const handleCrossSectionChange = (value: string) => {
    if (isValidNumberInput(value)) {
      const updatedPopover = { ...popover, crossSection: value };
      setPopover(updatedPopover);
      // Apply changes immediately (only if value is complete, not intermediate like "2.")
      const numValue = parseNumber(value);
      if (value !== "" && value !== "." && value !== "," && value !== "-") {
        // Clamp value to valid range
        const clampedValue = Math.max(
          RANGES.CROSS_SECTION.MIN,
          Math.min(RANGES.CROSS_SECTION.MAX, numValue)
        );
        onUpdateSegment(updatedPopover.segmentIndex, clampedValue, updatedPopover.isCopper);
      }
    }
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isCopper = e.target.checked;
    const updatedPopover = { ...popover, isCopper };
    setPopover(updatedPopover);
    // Apply changes immediately - use parsed value or default
    const numValue = parseNumber(popover.crossSection) || DEFAULTS.CROSS_SECTION;
    const clampedValue = Math.max(
      RANGES.CROSS_SECTION.MIN,
      Math.min(RANGES.CROSS_SECTION.MAX, numValue)
    );
    onUpdateSegment(updatedPopover.segmentIndex, clampedValue, updatedPopover.isCopper);
  };

  return (
    <div
      className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 p-4 min-w-[200px]"
      style={{
        left: `${popover.x}px`,
        top: `${popover.y}px`,
        transform: "translateX(-50%)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-3">
        <label className="text-gray-300 text-xs mb-1 block">
          Cross Section (mm²) [{RANGES.CROSS_SECTION.MIN} - {RANGES.CROSS_SECTION.MAX}]
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={popover.crossSection}
          onChange={(e) => handleCrossSectionChange(e.target.value)}
          className="bg-gray-900 border-2 border-gray-700 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none transition-colors w-full text-sm"
          autoFocus
        />
      </div>
      
      <div className="mb-3">
        <label className="text-gray-300 text-xs flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={popover.isCopper}
            onChange={handleMaterialChange}
            className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2"
          />
          <span>Copper?</span>
        </label>
      </div>

      <div className="text-xs text-gray-400 text-center mt-2">
        Press ESC to close
      </div>
    </div>
  );
}
