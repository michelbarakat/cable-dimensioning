import { createFileRoute } from "@tanstack/react-router";
import CrossSection from "../components/CrossSection";
import { useCableEngine } from "./__root";

export const Route = createFileRoute("/cross-section")({
  component: CrossSectionPage,
});

function CrossSectionPage() {
  const cableEngine = useCableEngine();
  return <CrossSection cableEngine={cableEngine} />;
}

