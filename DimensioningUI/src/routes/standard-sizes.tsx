import { createFileRoute } from "@tanstack/react-router";
import StandardSizes from "../components/StandardSizes/StandardSizes";
import { useCableEngine } from "./__root";

export const Route = createFileRoute("/standard-sizes")({
  component: StandardSizesPage,
});

function StandardSizesPage() {
  const cableEngine = useCableEngine();
  return <StandardSizes cableEngine={cableEngine} />;
}

