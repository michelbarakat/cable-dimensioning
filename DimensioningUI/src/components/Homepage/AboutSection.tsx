import { Typography } from "@core/ui-headless";
import { Section } from "./Section";

export function AboutSection() {
  return (
    <Section>
      <Typography level="h2">About This Project</Typography>
      <Typography level="p">
        This is a web-based cable dimensioning <strong className="text-blue-500 text-lg">Proof of Concept</strong> tool built with <strong className="text-accent-500 text-lg">WebAssembly</strong> for high-performance
        electrical engineering calculations. The core calculation engine is written in C and
        compiled to WebAssembly using Emscripten. All WASM computations run in a <strong className="text-accent-500 text-lg">Web Worker</strong>,
        ensuring fast, non-blocking computations that keep the UI fully responsive even during heavy calculations.
      </Typography>
      <Typography level="p" className="mt-3">
        The application supports <strong className="text-accent-500 text-lg">offline mode</strong> after the initial visit, all assets including WASM modules are cached,
        allowing you to use the tool without an internet connection. The offline indicator in the navigation shows your connection status.
      </Typography>
    </Section>
  );
}
