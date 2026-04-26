import Link from "next/link";

export default function NotFound() {
  const links = [
    { href: "/", label: "Go home" },
    { href: "/platform/pc", label: "Browse PC games" },
    { href: "/best-pc-games-2025", label: "Best PC games of 2025" },
    { href: "/new-games", label: "New games" },
    { href: "/upcoming-games", label: "Upcoming games" }
  ];

  return (
    <main
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "grid",
        placeItems: "center",
        padding: "48px 20px"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "760px",
          textAlign: "center",
          padding: "28px",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.1)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))"
        }}
      >
        <div
          style={{
            color: "#8bb9ff",
            fontWeight: 800,
            fontSize: "0.82rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "10px"
          }}
        >
          404
        </div>

        <h1
          style={{
            margin: 0,
            color: "#f5f7fb",
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 1,
            letterSpacing: "-0.04em"
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            maxWidth: "560px",
            margin: "16px auto 0 auto",
            color: "#a7b1c6",
            fontSize: "1.05rem",
            lineHeight: 1.65
          }}
        >
          You’re not lost — here are better places to find great games.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
            marginTop: "24px"
          }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "11px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "#f5f7fb",
                fontWeight: 700,
                textDecoration: "none",
                lineHeight: 1.2
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
