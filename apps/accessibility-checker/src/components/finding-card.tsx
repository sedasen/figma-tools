import { Button } from "@figma-tools/ui/components/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layers01Icon } from "@hugeicons/core-free-icons";
import type { Finding } from "../lib/messages";

export const categoryNames = {
  contrast: "Contrast",
  "font-size": "Font Size",
  "touch-target": "Touch Target",
  heading: "Heading Hierarchy",
  readability: "Text Readability",
};

export function FindingCard({
  finding,
  onFocus,
  onFix,
  busy = false,
}: {
  finding: Finding;
  onFocus?: () => void;
  onFix?: () => void;
  busy?: boolean;
}) {
  return (
    <article className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {onFocus ? (
            <button
              className="flex min-w-0 max-w-full items-center gap-2 rounded-md bg-muted/50 px-2 py-1 text-left text-xs hover:bg-muted focus-visible:outline-2"
              onClick={onFocus}
              aria-label={`Locate ${finding.name}`}
              title={`Locate Layer: ${finding.name}`}
            >
              <HugeiconsIcon
                icon={Layers01Icon}
                size={14}
                className="shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-muted-foreground">Layer</span>
              <span className="truncate font-medium">{finding.name}</span>
            </button>
          ) : (
            <h3 className="text-sm font-medium">{finding.name}</h3>
          )}
        </div>
        <span
          title={
            finding.status === "review"
              ? "Manual review or contextual design guidance; not a confirmed WCAG failure."
              : undefined
          }
          className={`shrink-0 rounded px-2 py-1 text-xs result-${finding.status}`}
        >
          {finding.status === "review"
            ? "Needs Review"
            : finding.status === "fail"
              ? "Fail"
              : "Pass"}
        </span>
      </div>
      {finding.foreground && finding.background && (
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Foreground", finding.foreground],
            ["Background", finding.background],
          ].map(([label, color]) => (
            <div
              key={label}
              className="min-w-0 space-y-2 rounded-lg bg-muted/50 p-3"
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span
                  className="size-4 rounded border"
                  style={{ backgroundColor: color }}
                />
                {color.replace("#", "")}
              </div>
            </div>
          ))}
        </div>
      )}
      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-muted-foreground">
            {finding.ratio !== undefined ? "Contrast" : "Current"}
          </dt>
          <dd className="mt-1 font-medium">
            {finding.ratio !== undefined
              ? `${finding.ratio.toFixed(2)}:1`
              : (finding.current ?? "Manual review")}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Recommended</dt>
          <dd className="mt-1 font-medium">
            {finding.required
              ? `${finding.required}:1`
              : (finding.recommended ?? "Check in context")}
          </dd>
        </div>
      </dl>
      <p className="text-xs leading-relaxed">{finding.detail}</p>
      {finding.suggestion && (
        <div className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed">
          <p className="mb-1 font-medium">Suggestion</p>
          <p className="text-muted-foreground">{finding.suggestion}</p>
        </div>
      )}
      {finding.fixColor && onFix && (
        <div className="flex justify-end">
          <Button
            className="w-full"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onFix}
          >
            Fix Color{" "}
            <span className="font-mono text-xs">{finding.fixColor}</span>
          </Button>
        </div>
      )}
      {finding.fixAction && onFix && (
        <div className="flex justify-end">
          <Button
            className="w-full"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onFix}
          >
            {finding.fixAction === "font-size"
              ? "Fix Font Size · 16 px"
              : "Fix Line Height · 150%"}
          </Button>
        </div>
      )}
    </article>
  );
}
