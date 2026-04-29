export const platforms = {
  pc: {
    slug: "pc",
    name: "PC",
    igdbIds: [6]
  },

  playstation: {
    slug: "playstation",
    name: "PlayStation",
    igdbIds: [48, 167]
  },

  xbox: {
    slug: "xbox",
    name: "Xbox",
    igdbIds: [49, 169]
  },

  switch: {
    slug: "switch",
    name: "Switch",
    igdbIds: [130]
  },

  ios: {
    slug: "ios",
    name: "iOS",
    igdbIds: [39]
  },

  android: {
    slug: "android",
    name: "Android",
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