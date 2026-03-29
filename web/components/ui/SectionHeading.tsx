type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  centered?: boolean;
};

export default function SectionHeading({
  title,
  subtitle,
  centered = false
}: SectionHeadingProps) {
  return (
    <div className={`sectionHeading${centered ? " sectionHeadingCentered" : ""}`}>
      <div className="sectionHeadingTop">
        <h2 className="sectionHeadingTitle">
          {title}
        </h2>

        <div className="sectionHeadingDivider" />
      </div>

      {subtitle && (
        <p className="sectionHeadingSubtitle">
          {subtitle}
        </p>
      )}
    </div>
  );
}