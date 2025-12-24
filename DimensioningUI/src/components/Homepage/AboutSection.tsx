import { Typography } from "@core/ui-headless";
import { Section } from "./Section";

export function AboutSection() {
  return (
    <Section>
      <Typography level="h2">About This Project</Typography>
      <Typography level="p">
        This is a web-based cable dimensioning tool built with <strong className="text-accent-500">WebAssembly</strong> for high-performance
        electrical engineering calculations. The core calculation engine is written in C and
        compiled to WebAssembly using Emscripten. All WASM computations run in a <strong className="text-accent-500">Web Worker</strong>,
        ensuring fast, non-blocking computations that keep the UI fully responsive even during heavy calculations.
      </Typography>
    </Section>
  );
}
