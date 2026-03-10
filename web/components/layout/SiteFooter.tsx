import Link from "next/link";
import PageContainer from "./PageContainer";

export default function SiteFooter() {
  return (
    <footer
      style={{
        marginTop: "64px",
        borderTop: "1px solid #23262d",
        backgroundColor: "#0f1115"
      }}
    >
      <PageContainer>
        <div
          style={{
            paddingTop: "32px",
            paddingBottom: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: 800
            }}
          >
            Gamerly
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px"
            }}
          >
            <Link href="/new-games" style={{ color: "#c7cedb", textDecoration: "none" }}>
              New Games
            </Link>
            <Link href="/upcoming-games" style={{ color: "#c7cedb", textDecoration: "none" }}>
              Upcoming Games
            </Link>
            <Link href="/platform/pc" style={{ color: "#c7cedb", textDecoration: "none" }}>
              PC Games
            </Link>
            <Link href="/genre/rpg" style={{ color: "#c7cedb", textDecoration: "none" }}>
              RPG Games
            </Link>
            <Link href="/releases" style={{ color: "#c7cedb", textDecoration: "none" }}>
              Release Calendar
            </Link>
          </div>

          <p
            style={{
              margin: 0,
              color: "#8f98a8",
              fontSize: "14px",
              lineHeight: 1.6
            }}
          >
            Discover new and upcoming video games by platform, genre, and release date.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}