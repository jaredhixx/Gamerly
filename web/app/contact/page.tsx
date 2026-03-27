import type { Metadata } from "next";
import PageContainer from "../../components/layout/PageContainer";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Contact Gamerly",
  description:
    "Contact Gamerly for questions, feedback, corrections, or business inquiries related to the site.",
  alternates: {
    canonical: buildCanonicalUrl("/contact"),
  },
};

const sectionStyle = {
  marginBottom: "32px",
};

const headingStyle = {
  fontSize: "22px",
  fontWeight: 800,
  marginBottom: "12px",
};

const paragraphStyle = {
  lineHeight: 1.7,
  marginBottom: "16px",
};

export default function ContactPage() {
  return (
    <PageContainer>
      <main style={{ padding: "40px 0", maxWidth: "840px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
          Contact Gamerly
        </h1>

        <p style={paragraphStyle}>
          If you have a question, feedback, or need to report something on the
          site, you can reach out directly using the email below.
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>General inquiries and feedback</h2>

          <p style={paragraphStyle}>
            For general questions about the site, feature suggestions, or feedback
            on the user experience, feel free to get in touch. Input from users is
            valuable for improving how Gamerly surfaces and organizes games.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Corrections and data issues</h2>

          <p style={paragraphStyle}>
            If you notice incorrect game information, missing titles, or issues
            with how a page is structured or ranked, you can report it here. Gamerly
            is continuously improving its data and presentation, and corrections
            help improve overall quality.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Business and partnership inquiries</h2>

          <p style={paragraphStyle}>
            For business-related inquiries, partnerships, or other professional
            communication, please use the same contact email below and include
            relevant details in your message.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Contact email</h2>

          <p style={{ ...paragraphStyle, fontWeight: 700 }}>
            gamerly.net@gmail.com
          </p>
        </section>

        <section style={{ marginBottom: 0 }}>
          <p style={paragraphStyle}>
            Gamerly is focused on helping players discover relevant, high-interest
            games across all major platforms in a faster and more structured way.
          </p>
        </section>
      </main>
    </PageContainer>
  );
}