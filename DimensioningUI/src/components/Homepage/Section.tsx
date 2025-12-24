import { SECTION_CLASSES, SECTION_TITLE_CLASSES } from "./constants";

type SectionProps = {
  title?: string;
  children: React.ReactNode;
};

export function Section({ title, children }: SectionProps) {
  return (
    <section className={SECTION_CLASSES}>
      {title && <h2 className={SECTION_TITLE_CLASSES}>{title}</h2>}
      {children}
    </section>
  );
}
