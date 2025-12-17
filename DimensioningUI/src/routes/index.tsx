import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function AboutSection() {
  return (
    <section className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h2 className="text-3xl font-bold mb-4 text-white">About This Project</h2>
      <p className="text-gray-300 leading-relaxed text-lg">
        This is a web-based cable dimensioning tool built with WebAssembly for high-performance
        electrical engineering calculations. The core calculation engine is written in C and
        compiled to WebAssembly using Emscripten. All WASM computations run in a <strong className="text-blue-400">Web Worker</strong>,
        ensuring fast, non-blocking computations that keep the UI fully responsive even during heavy calculations.
      </p>
    </section>
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
      <span className="text-blue-400 text-xl mt-1">{icon}</span>
      <div>
        <strong className="text-white text-lg">{title}</strong>
        <p className="text-gray-400 mt-1">{description}</p>
      </div>
    </li>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-white">Features</h2>
      <ul className="space-y-4">
        {features.map((feature) => (
          <FeatureItem key={feature.title} {...feature} />
        ))}
      </ul>
    </section>
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
    <section className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-white">Technology Stack</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {techStack.map((item) => (
          <div key={item.title} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className={`${item.color} font-semibold mb-2`}>{item.title}</h3>
            <p className="text-gray-300 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function GetStartedSection() {
  return (
    <section className="bg-linear-to-r from-blue-900 to-purple-900 rounded-lg p-6 shadow-lg border border-blue-700">
      <h2 className="text-3xl font-bold mb-4 text-white">Get Started</h2>
      <p className="text-gray-200 leading-relaxed text-lg mb-6">
        Use the navigation menu above to access the different calculation tools. All calculations
        run in WebAssembly within a Web Worker thread, ensuring optimal performance and keeping the UI
        fully responsive even during heavy computations. You can interact with the interface, drag elements,
        and see real-time updates without any freezing or lag.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          to="/resistivity"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold shadow-lg hover:shadow-xl"
        >
          Start with Resistivity →
        </Link>
        <Link
          to="/voltage-drop"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-semibold shadow-lg hover:shadow-xl"
        >
          Calculate Voltage Drop →
        </Link>
      </div>
    </section>
  );
}

function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <AboutSection />
      <FeaturesSection />
      <TechnologyStackSection />
      <GetStartedSection />
    </div>
  );
}

