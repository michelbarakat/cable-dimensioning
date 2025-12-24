import { createFileRoute } from "@tanstack/react-router";
import { Typography } from "@core/ui-headless";
import { AboutSection } from "../components/Homepage/AboutSection";
import { FeaturesSection } from "../components/Homepage/FeaturesSection";
import { TechnologyStackSection } from "../components/Homepage/TechnologyStackSection";
import { GetStartedSection } from "../components/Homepage/GetStartedSection";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col gap-2">
      <Typography level="h1" className="text-center">
        CABLE DIMENSIONING - WEB ASSEMBLY
      </Typography>
      <AboutSection />
      <FeaturesSection />
      <TechnologyStackSection />
      <GetStartedSection />
    </div>
  );
}

