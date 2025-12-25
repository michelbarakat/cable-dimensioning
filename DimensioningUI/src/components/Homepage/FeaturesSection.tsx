import { Section } from "./Section";

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
  {
    icon: "✏️",
    title: "Interactive Canvas",
    description: "Draw cable segments on a canvas with floorplan support, real-time voltage drop calculations, and intuitive editing tools",
  },
  {
    icon: "📱",
    title: "Offline Mode",
    description: "Works offline after initial load - all assets are cached for offline use",
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

export function FeaturesSection() {
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
