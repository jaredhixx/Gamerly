export const genres = {
  rpg: "Role Playing",
  shooter: "Shooter",
  adventure: "Adventure",
  strategy: "Strategy",
  simulation: "Simulation",
  puzzle: "Puzzle",
  indie: "Indie",
  fighting: "Fighting",
  racing: "Racing",
  sport: "Sports"
} as const;

export type GenreSlug = keyof typeof genres;

export const genreNameToSlug: Record<string, GenreSlug> = {
  "role playing": "rpg",
  "role-playing": "rpg",
  "role playing (rpg)": "rpg",
  "rpg": "rpg",
  "shooter": "shooter",
  "adventure": "adventure",
  "strategy": "strategy",
  "simulation": "simulation",
  "simulator": "simulation",
  "sim": "simulation",
  "puzzle": "puzzle",
  "indie": "indie",
  "fighting": "fighting",
  "racing": "racing",
  "sport": "sport",
  "sports": "sport"
};