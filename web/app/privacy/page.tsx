import type { Metadata } from "next";
import PageContainer from "../../components/layout/PageContainer";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Gamerly privacy policy and learn how the site handles basic visitor data and third-party services.",
  alternates: {
    canonical: buildCanonicalUrl("/privacy"),
  },
};

export default function PrivacyPage() {
  return (
    <PageContainer>
      <main style={{ padding: "40px 0" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
          Privacy Policy
        </h1>

        <p style={{ lineHeight: 1.7, marginBottom: "16px" }}>
          Gamerly may collect limited technical data that is commonly used to run
          and improve a website, such as device type, browser type, pages visited,
          and referral information.
        </p>

        <p style={{ lineHeight: 1.7, marginBottom: "16px" }}>
          Gamerly may also use third-party services for hosting, analytics,
          advertising, and embedded content. These providers may collect data
          according to their own privacy policies.
        </p>

        <p style={{ lineHeight: 1.7, marginBottom: "16px" }}>
          Gamerly does not sell user accounts or require account creation for
          normal browsing.
        </p>

        <p style={{ lineHeight: 1.7 }}>
          If Gamerly adds analytics, advertising, affiliate systems, or contact
          forms over time, this policy can be updated to reflect those changes.
        </p>
      </main>
    </PageContainer>
  );
}