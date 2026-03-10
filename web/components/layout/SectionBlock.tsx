import { ReactNode } from "react";

type SectionBlockProps = {
  children: ReactNode;
};

export default function SectionBlock({ children }: SectionBlockProps) {
  return (
    <section className="sectionBlock">
      {children}
    </section>
  );
}