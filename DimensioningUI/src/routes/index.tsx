import { createFileRoute, Link } from "@tanstack/react-router";
import { Typography } from "@core/ui-headless";

export const Route = createFileRoute("/")({
  component: Home,
});

const SECTION_CLASSES = "bg-surface rounded-sm p-3 border border-section-border";
const SECTION_TITLE_CLASSES = "text-3xl font-bold text-text-primary";
const CARD_CLASSES = "bg-neutral-800 rounded-sm p-3 border border-section-border";
const LINK_BASE_CLASSES = "px-4 py-2 text-white rounded-sm transition-colors font-semibold";

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={SECTION_CLASSES}>
      {title && <h2 className={SECTION_TITLE_CLASSES}>{title}</h2>}
      {children}
    </section>
  );
}

function AboutSection() {
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

type Feature = {
  icon: string;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: "⚡",
    title: "Resistivity Calculation",
    description: "Calculate material resistivity based on temperature and material type (copper/aluminum)",
  },
  {
    icon: "📊",
    title: "Voltage Drop",
    description: "Calculate voltage drop for single-phase, three-phase, and multi-segment chain configurations",
  },
  {
    icon: "📏",
    title: "Cross-Section Sizing",
    description: "Determine required cable cross-section based on current, length, and maximum voltage drop",
  },
  {
    icon: "🔥",
    title: "Power Loss",
    description: "Calculate power loss in cables",
  },
  {
    icon: "🌡️",
    title: "Current Derating",
    description: "Apply derating factors based on ambient temperature",
  },
  {
    icon: "📐",
    title: "Standard Sizes",
    description: "Round calculated cross-sections to standard cable sizes",
  },
];

function FeatureItem({ icon, title, description }: Feature) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-accent-500 text-xl mt-1">{icon}</span>
      <div>
        <strong className="text-text-primary text-lg">{title}</strong>
        <p className="text-text-tertiary mt-1">{description}</p>
      </div>
    </li>
  );
}

function FeaturesSection() {
  return (
    <Section title="Features">
      <ul className="space-y-4">
        {features.map((feature) => (
          <FeatureItem key={feature.title} {...feature} />
        ))}
      </ul>
    </Section>
  );
}

type TechStackItem = {
  title: string;
  color: string;
  description: string;
};

const techStack: TechStackItem[] = [
  {
    title: "Frontend",
    color: "text-blue-400",
    description: "React 19, TypeScript, Tailwind CSS, TanStack Router",
  },
  {
    title: "Computation",
    color: "text-green-400",
    description: "C compiled to WebAssembly via Emscripten, executed in Web Workers for optimal performance",
  },
  {
    title: "Build Tools",
    color: "text-purple-400",
    description: "Vite, Biome (linting/formatting)",
  },
];

function TechnologyStackSection() {
  return (
    <Section title="Technology Stack">
      <div className="grid md:grid-cols-3 gap-4">
        {techStack.map((item) => (
          <div key={item.title} className={CARD_CLASSES}>
            <h3 className={`${item.color} font-semibold mb-2`}>{item.title}</h3>
            <p className="text-text-tertiary text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function GetStartedSection() {
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

