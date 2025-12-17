import { createFileRoute } from "@tanstack/react-router";
import CableCanvas from "../components/Canvas/CableCanvas";
import { useCableEngine } from "./__root";

export const Route = createFileRoute("/canvas")({
  component: CanvasPage,
});

function CanvasPage() {
  const cableEngine = useCableEngine();
  return <CableCanvas cableEngine={cableEngine} />;
}

