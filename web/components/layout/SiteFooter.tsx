import Link from "next/link";
import PageContainer from "./PageContainer";

export default function SiteFooter() {
  return (
    <footer className="siteFooter">
      <PageContainer>

        <div className="footerGrid">

          {/* Brand */}

          <div className="footerBrand">
            <div className="footerLogo">Gamerly</div>

            <p className="footerTagline">
              Discover new and upcoming video games across PC, PlayStation,
              Xbox, Nintendo Switch, and mobile platforms.
            </p>
          </div>

          {/* Discover */}

          <div className="footerColumn">
            <div className="footerHeading">Discover</div>

            <Link href="/new-games">New Games</Link>
            <Link href="/upcoming-games">Upcoming Games</Link>
            <Link href="/live-games">Live Games</Link>
            <Link href="/top-rated">Top Rated</Link>
            <Link href="/releases">Release Calendar</Link>
          </div>

          {/* Platforms */}

          <div className="footerColumn">
            <div className="footerHeading">Platforms</div>

            <Link href="/platform/pc">PC</Link>
            <Link href="/platform/playstation">PlayStation</Link>
            <Link href="/platform/xbox">Xbox</Link>
            <Link href="/platform/switch">Nintendo Switch</Link>
          </div>

          {/* Genres */}

          <div className="footerColumn">
            <div className="footerHeading">Genres</div>

            <Link href="/genre/rpg">RPG</Link>
            <Link href="/genre/shooter">Shooter</Link>
            <Link href="/genre/strategy">Strategy</Link>
            <Link href="/genre/adventure">Adventure</Link>
            <Link href="/genre/indie">Indie</Link>
          </div>

        </div>

        <div className="footerBottom">

          <div>© {new Date().getFullYear()} Gamerly</div>

          <div className="footerLegal">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </div>

        </div>

      </PageContainer>
    </footer>
  );
}