import { HugeiconsIcon } from "@hugeicons/react";
import {
  FigmaIcon,
  GithubIcon,
  PuzzleIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@figma-tools/ui/components/button";
import { PUBLIC_LINKS, type PublicLink } from "@/lib/links";

const links = [
  { key: "figma", label: "Figma Community profile", icon: FigmaIcon },
  { key: "plugin", label: "ChromaKit on Figma Community", icon: PuzzleIcon },
  { key: "github", label: "GitHub profile", icon: GithubIcon },
] as const;

function openLink(key: PublicLink) {
  const url = PUBLIC_LINKS[key];
  if (!url) return;
  if (window.parent !== window) {
    window.parent.postMessage(
      { pluginMessage: { type: "open-link", key } },
      "*",
    );
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function Footer({
  dark,
  onToggleTheme,
}: {
  dark: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <footer
      className="mt-auto shrink-0 border-t px-6 py-3"
      aria-label="ChromaKit links and appearance"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="min-w-0 text-xs leading-5 text-muted-foreground">
          Your colors, in every format.
        </p>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {links.map(({ key, label, icon }) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={!PUBLIC_LINKS[key]}
              aria-label={label}
              title={PUBLIC_LINKS[key] ? label : `${label} — coming soon`}
              onClick={() => openLink(key)}
            >
              <HugeiconsIcon icon={icon} size={16} aria-hidden="true" />
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            title={dark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={onToggleTheme}
          >
            <HugeiconsIcon
              icon={dark ? Sun03Icon : Moon02Icon}
              size={16}
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </footer>
  );
}
