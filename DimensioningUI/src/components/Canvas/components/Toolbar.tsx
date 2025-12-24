import type { Tool } from "../types";
import { ButtonGroup, IconButton, NumberInput, Tooltip } from "@core/ui-headless";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Select01Icon,
  Delete01Icon,
  LinerIcon,
  Undo02Icon,
  Redo02Icon,
  Grid02Icon,
  Magnet01Icon,
  Delete02Icon,
  Upload01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { useRef } from "react";

type ToolbarProps = {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  scale: number;
  onScaleIncrement: () => void;
  onScaleDecrement: () => void;
  setScale: (scale: number) => void;
  showGrid: boolean;
  snapToGrid: boolean;
  historyIndex: number;
  historyLength: number;
  setShowGrid: (value: boolean) => void;
  setSnapToGrid: (value: boolean) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleClear: () => void;
  onFloorplanUpload: (file: File) => void;
};

type ToolButtonConfig = {
  tool: Tool;
  icon: typeof Select01Icon;
  color: "success" | "primary" | "danger";
  title: string;
};

const TOOL_BUTTONS: ToolButtonConfig[] = [
  {
    tool: "select",
    icon: Select01Icon,
    color: "success",
    title: "Selection Tool - Move and resize segments",
  },
  {
    tool: "line",
    icon: LinerIcon,
    color: "primary",
    title: "Segment Tool - Draw cable segments",
  },
  {
    tool: "erase",
    icon: Delete01Icon,
    color: "danger",
    title: "Erase Tool - Delete segments or cross sections",
  },
];

const MIN_SCALE = 10;
const MAX_SCALE = 1000;

function VerticalDivider() {
  return <div className="h-3 w-px bg-section-border self-center" />;
}

const createScaleChangeHandler = (setScale: (scale: number) => void) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseInt(e.target.value, 10);
    const isValidNumber = !isNaN(numericValue);
    const isWithinRange =
      numericValue >= MIN_SCALE && numericValue <= MAX_SCALE;
    const shouldUpdate = isValidNumber && isWithinRange;
    if (shouldUpdate) {
      setScale(numericValue);
    }
  };
};

function ToolButtons({
  activeTool,
  setActiveTool,
}: {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}) {
  return (
    <ButtonGroup variant="soft" color="neutral" size="sm">
      {TOOL_BUTTONS.map((config) => {
        const isActive = activeTool === config.tool;
        return (
          <Tooltip key={config.tool} content={config.title} size="sm">
            <IconButton
              onClick={() => setActiveTool(config.tool)}
              variant={isActive ? "solid" : "soft"}
              color={isActive ? config.color : "neutral"}
              size="sm"
              icon={<HugeiconsIcon icon={config.icon} />}
            />
          </Tooltip>
        );
      })}
    </ButtonGroup>
  );
}

function ScaleControl({
  scale,
  setScale,
}: {
  scale: number;
  setScale: (scale: number) => void;
}) {
  const handleScaleChange = createScaleChangeHandler(setScale);

  return (
    <div className="flex items-center gap-2">
      <label className="text-gray-300 font-medium text-sm">Scale (px/m):</label>
      <div className="flex items-center gap-2">
        <NumberInput
          value={scale}
          onChange={handleScaleChange}
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={10}
          className="w-20 text-center"
          size="sm"
        />
      </div>
    </div>
  );
}

export function Toolbar({
  activeTool,
  setActiveTool,
  scale,
  setScale,
  showGrid,
  snapToGrid,
  historyIndex,
  historyLength,
  setShowGrid,
  setSnapToGrid,
  handleUndo,
  handleRedo,
  handleClear,
  onFloorplanUpload,
}: ToolbarProps) {
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFloorplanUpload(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-surface p-1">
      <div className="flex items-center gap-2">
        <ButtonGroup variant="soft" color="neutral" size="sm">
          <Tooltip content="Undo" size="sm">
            <IconButton
              onClick={handleUndo}
              disabled={!canUndo}
              size="sm"
              color="neutral"
              icon={<HugeiconsIcon icon={Undo02Icon} />}
            />
          </Tooltip>
          <Tooltip content="Redo" size="sm">
            <IconButton
              onClick={handleRedo}
              disabled={!canRedo}
              size="sm"
              color="neutral"
              icon={<HugeiconsIcon icon={Redo02Icon} />}
            />
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup variant="soft" color="warning" size="sm">
          <Tooltip content={showGrid ? "Hide Grid" : "Show Grid"} size="sm">
            <IconButton
              onClick={() => setShowGrid(!showGrid)}
              variant={showGrid ? "solid" : "soft"}
              color={showGrid ? "warning" : "warning"}
              size="sm"
              icon={<HugeiconsIcon icon={Grid02Icon} />}
            />
          </Tooltip>
          <Tooltip content={snapToGrid ? "Disable Snap to Grid" : "Enable Snap to Grid"} size="sm">
            <IconButton
              onClick={() => setSnapToGrid(!snapToGrid)}
              variant={snapToGrid ? "solid" : "soft"}
              color={snapToGrid ? "warning" : "warning"}
              size="sm"
              icon={<HugeiconsIcon icon={Magnet01Icon} />}
            />
          </Tooltip>
        </ButtonGroup>

        <VerticalDivider />

        <ToolButtons activeTool={activeTool} setActiveTool={setActiveTool} />

        <VerticalDivider />

        <Tooltip content="Upload Floorplan" size="sm">
          <IconButton
            onClick={handleUploadClick}
            variant="soft"
            color="primary"
            size="sm"
            icon={<HugeiconsIcon icon={Upload01Icon} />}
          />
        </Tooltip>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <div className="flex-1" />

        <ScaleControl scale={scale} setScale={setScale} />

        <Tooltip content="Clear Canvas" size="sm">
          <IconButton
            onClick={handleClear}
            variant="soft"
            color="danger"
            size="sm"
            icon={<HugeiconsIcon icon={Delete02Icon} />}
          />
        </Tooltip>
      </div>
    </div>
  );
}
