import type { Metadata } from "next";
import PageContainer from "../../components/layout/PageContainer";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Gamerly privacy policy to understand what basic data may be collected, how third-party services may be used, and how this policy may change over time.",
  alternates: {
    canonical: buildCanonicalUrl("/privacy"),
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

export default function PrivacyPage() {
  return (
    <PageContainer>
      <main style={{ padding: "40px 0", maxWidth: "840px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
          Privacy Policy
        </h1>

        <p style={paragraphStyle}>
          This Privacy Policy explains, in general terms, how Gamerly may handle
          basic visitor information when you use the site.
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Information that may be collected</h2>

          <p style={paragraphStyle}>
            Like many websites, Gamerly may collect limited technical and usage
            information that helps operate, maintain, and improve the site. This
            may include information such as browser type, device type, approximate
            location based on IP address, pages visited, referral sources, and
            general interaction data.
          </p>

          <p style={paragraphStyle}>
            This information is typically used for site performance, reliability,
            traffic understanding, and general improvement of the user experience.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Third-party services</h2>

          <p style={paragraphStyle}>
            Gamerly may use third-party services for hosting, analytics,
            advertising, embedded media, or other website functionality. Those
            third-party providers may collect or process data according to their
            own privacy policies and practices.
          </p>

          <p style={paragraphStyle}>
            Because third-party services can change over time, the exact services
            used by Gamerly may also change as the platform grows.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Accounts and personal information</h2>

          <p style={paragraphStyle}>
            Gamerly does not require account creation for normal browsing of the
            site. Gamerly also does not sell user accounts.
          </p>

          <p style={paragraphStyle}>
            If direct contact features, account systems, newsletters, or other
            user-submitted features are added in the future, this policy may be
            updated to reflect what information is collected and how it is used.
          </p>
        </section>

        <section style={{ marginBottom: 0 }}>
          <h2 style={headingStyle}>Policy updates</h2>

          <p style={paragraphStyle}>
            Gamerly may update this Privacy Policy from time to time as the site
            evolves, including if analytics, advertising systems, affiliate tools,
            contact forms, or additional features are introduced.
          </p>

          <p style={paragraphStyle}>
            Continued use of the site after changes are published means you accept
            the updated policy.
          </p>
        </section>
      </main>
    </PageContainer>
  );
}