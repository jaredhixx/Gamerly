type SectionHeadingProps = {
  title: string;
  subtitle?: string;
};

export default function SectionHeading({
  title,
  subtitle
}: SectionHeadingProps) {
  return (
    <div className="sectionHeading">

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