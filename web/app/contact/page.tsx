import type { Metadata } from "next";
import PageContainer from "../../components/layout/PageContainer";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Gamerly for site questions, feedback, corrections, or business inquiries.",
  alternates: {
    canonical: buildCanonicalUrl("/contact"),
  },
};

export default function ContactPage() {
  return (
    <PageContainer>
      <main style={{ padding: "40px 0" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
          Contact Gamerly
        </h1>

        <p style={{ lineHeight: 1.7, marginBottom: "16px" }}>
          For general questions, corrections, feedback, or business inquiries,
          please reach out using your preferred public contact method.
        </p>

        <p style={{ lineHeight: 1.7, marginBottom: "16px" }}>
          Gamerly.net@gmail.com
        </p>

        <p style={{ lineHeight: 1.7 }}>
          Gamerly is focused on helping users discover worthwhile games across all
          major gaming platforms.
        </p>
      </main>
    </PageContainer>
  );
}