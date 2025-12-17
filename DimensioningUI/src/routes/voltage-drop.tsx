import { createFileRoute } from "@tanstack/react-router";
import VoltageDrop from "../components/VoltageDrop";
import { useCableEngine } from "./__root";

export const Route = createFileRoute("/voltage-drop")({
  component: VoltageDropPage,
});

function VoltageDropPage() {
  const cableEngine = useCableEngine();
  return <VoltageDrop cableEngine={cableEngine} />;
}

