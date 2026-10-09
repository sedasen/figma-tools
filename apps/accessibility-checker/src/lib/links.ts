export const PUBLIC_LINKS = {
  figma: "https://www.figma.com/@seda",
  // Enable once this plugin has its own published Community URL.
  plugin: "",
  github: "https://github.com/sedasen",
} as const;

export type PublicLink = keyof typeof PUBLIC_LINKS;
