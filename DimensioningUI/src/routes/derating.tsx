import { createFileRoute } from "@tanstack/react-router";
import Derating from "../components/Derating/Derating";
import { useCableEngine } from "./__root";

export const Route = createFileRoute("/derating")({
  component: DeratingPage,
});

function DeratingPage() {
  const cableEngine = useCableEngine();
  return <Derating cableEngine={cableEngine} />;
}

