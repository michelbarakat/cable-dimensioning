import { Link } from "@tanstack/react-router";
import { Section } from "./Section";
import { LINK_BASE_CLASSES } from "./constants";

export function GetStartedSection() {
  return (
    <Section title="Get Started">
      <p className="text-text-tertiary leading-relaxed text-lg mb-6">
        Use the navigation menu above to access the different calculation tools. All calculations
        run in WebAssembly within a Web Worker thread, ensuring optimal performance and keeping the UI
        fully responsive even during heavy computations. You can interact with the interface, drag elements,
        and see real-time updates without any freezing or lag.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          to="/resistivity"
          className={`${LINK_BASE_CLASSES} bg-accent-500 hover:bg-accent-600`}
        >
          Start with Resistivity →
        </Link>
        <Link
          to="/voltage-drop"
          className={`${LINK_BASE_CLASSES} bg-primary-400 hover:bg-primary-500`}
        >
          Calculate Voltage Drop →
        </Link>
      </div>
    </Section>
  );
}
