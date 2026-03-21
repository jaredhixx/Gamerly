export const platforms = {
  pc: {
    slug: "pc",
    name: "PC Games",
    igdbIds: [6]
  },

  playstation: {
    slug: "playstation",
    name: "PlayStation Games",
    igdbIds: [48, 167]
  },

  xbox: {
    slug: "xbox",
    name: "Xbox Games",
    igdbIds: [49, 169]
  },

  switch: {
    slug: "switch",
    name: "Switch Games",
    igdbIds: [130]
  },

  ios: {
    slug: "ios",
    name: "iOS Games",
    igdbIds: [39]
  },

  android: {
    slug: "android",
    name: "Android Games",
    igdbIds: [34]
  }
} as const;

export type PlatformSlug = keyof typeof platforms;

export const platformIdToSlug: Record<number, PlatformSlug> = {
  6: "pc",
  48: "playstation",
  167: "playstation",
  49: "xbox",
  169: "xbox",
  130: "switch",
  39: "ios",
  34: "android"
};