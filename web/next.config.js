/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.igdb.com"
      }
    ]
  },

  async redirects() {
    return [
      {
        source: "/pc-games",
        destination: "/platform/pc",
        permanent: true
      },
      {
        source: "/xbox-games",
        destination: "/platform/xbox",
        permanent: true
      },
      {
        source: "/playstation-games",
        destination: "/platform/playstation",
        permanent: true
      },
      {
        source: "/switch-games",
        destination: "/platform/switch",
        permanent: true
      },
      {
        source: "/ios-games",
        destination: "/platform/ios",
        permanent: true
      },
      {
        source: "/android-games",
        destination: "/platform/android",
        permanent: true
      },
      {
        source: "/steam-games",
        destination: "/platform/pc",
        permanent: true
      },
      {
        source: "/steam-games-today",
        destination: "/games-releasing-today",
        permanent: true
      },
      {
        source: "/steam-games-this-week",
        destination: "/games-releasing-this-week",
        permanent: true
      },
      {
        source: "/steam-games-upcoming",
        destination: "/platform/pc/upcoming",
        permanent: true
      },
      {
        source: "/upcoming-pc-games",
        destination: "/platform/pc/upcoming",
        permanent: true
      },
      {
        source: "/upcoming-xbox-games",
        destination: "/platform/xbox/upcoming",
        permanent: true
      },
      {
        source: "/steam-games/genre/:genre",
        destination: "/genre/:genre",
        permanent: true
      },
      {
        source: "/games-releasing-this-month",
        destination: "/new-games-this-month",
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;