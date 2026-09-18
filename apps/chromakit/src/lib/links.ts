// Fill these with the owner's public URLs before publishing.
export const PUBLIC_LINKS = {
  figma: "https://www.figma.com/@seda",
  plugin: "",
  github: "https://github.com/sedasen",
} as const;

export type PublicLink = keyof typeof PUBLIC_LINKS;
