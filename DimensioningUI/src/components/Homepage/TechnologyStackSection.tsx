import { Section } from "./Section";
import { CARD_CLASSES } from "./constants";

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
    description: "Vite, Biome (linting/formatting), Emscripten",
  },
];

export function TechnologyStackSection() {
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
