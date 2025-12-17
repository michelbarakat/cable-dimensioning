import { createFileRoute } from "@tanstack/react-router";
import PowerLoss from "../components/PowerLoss/PowerLoss";
import { useCableEngine } from "./__root";

export const Route = createFileRoute("/power-loss")({
  component: PowerLossPage,
});

function PowerLossPage() {
  const cableEngine = useCableEngine();
  return <PowerLoss cableEngine={cableEngine} />;
}

