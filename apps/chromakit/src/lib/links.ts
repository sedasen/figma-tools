// Public destinations shared by the UI and Figma plugin.
export const PUBLIC_LINKS = {
  figma: "https://www.figma.com/@seda",
  plugin: "https://www.figma.com/community/plugin/1682698826675525021/chromakit",
  github: "https://github.com/sedasen",
} as const;

export type PublicLink = keyof typeof PUBLIC_LINKS;
