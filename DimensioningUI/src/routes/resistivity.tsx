import { createFileRoute } from "@tanstack/react-router";
import Resistivity from "../components/Resistivity/Resistivity";
import { useCableEngine } from "./__root";

export const Route = createFileRoute("/resistivity")({
  component: ResistivityPage,
});

function ResistivityPage() {
  const cableEngine = useCableEngine();
  return <Resistivity cableEngine={cableEngine} />;
}

