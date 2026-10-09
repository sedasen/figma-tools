import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BrowserIcon, PaintBoardIcon } from "@hugeicons/core-free-icons";
import { CheckIcon } from "@figma-tools/ui/components/icon";
import { Button } from "@figma-tools/ui/components/button";
import { Input } from "@figma-tools/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@figma-tools/ui/components/select";
import { Label } from "@figma-tools/ui/components/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@figma-tools/ui/components/tabs";
import { FindingCard, categoryNames } from "./components/finding-card";
import { contrast, parseHex, recommendColor, toHex } from "./lib/contrast";
import type { Finding, PluginResponse } from "./lib/messages";
import { connectBridge } from "./lib/bridge";
import { ContrastLevel } from "./components/contrast-level";
import { Footer } from "./components/footer";

const inFigma = window.parent !== window;
const send = (message: object) =>
  window.parent.postMessage({ pluginMessage: message }, "*");

export default function App() {
  const [foreground, setForeground] = useState("#6366F1");
  const [background, setBackground] = useState("#FFFFFF");
  const [dark, setDark] = useState(false);
  const [level, setLevel] = useState<"AA" | "AAA">("AA");
  const [auditLevel, setAuditLevel] = useState<"AA" | "AAA">("AA");
  const [manualNotice, setManualNotice] = useState("");
  const [count, setCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState("selection");
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [checkComplete, setCheckComplete] = useState(false);
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    const receive = (message: PluginResponse) => {
      if (message.type === "selection") {
        setCheckComplete(false);
        setConnected(true);
        setCount(message.count);
        setFindings(null);
        setBusy(false);
        setNotice("");
        setFilter("all");
        setCategory("all");
      }
      if (message.type === "results") {
        setCheckComplete(!message.truncated);
        setBusy(false);
        setFindings(message.findings);
        setNotice(
          message.truncated
            ? "Scan limit reached. Select a smaller frame for complete results."
            : "Check Complete",
        );
      }
      if (message.type === "error") {
        setCheckComplete(false);
        setBusy(false);
        setNotice(message.message);
      }
    };
    if (!inFigma) return;
    return connectBridge(window, () => send({ type: "ready" }), receive);
  }, []);
  useEffect(() => {
    if (!busy) return;
    const timeout = window.setTimeout(() => {
      setCheckComplete(false);
      setBusy(false);
      setNotice("The scan did not respond. Please try again.");
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, [busy]);
  const fg = parseHex(foreground),
    bg = parseHex(background);
  const ratio = fg && bg ? contrast(fg, bg) : null;
  const required = level === "AA" ? 4.5 : 7;
  const manualFix =
    fg && bg && ratio !== null && ratio < required
      ? recommendColor(fg, bg, required)
      : undefined;
  const statuses = [
    { name: "Normal Text", required: level === "AA" ? 4.5 : 7 },
    { name: "Large Text", required: level === "AA" ? 3 : 4.5 },
    { name: "UI Components", required: 3 },
  ];
  return (
    <div className="plugin-scroll mx-auto flex w-full max-w-[512px] flex-col bg-background">
      <h1 className="sr-only">Accessibility Checker</h1>
      <main className="flex flex-col gap-6 p-6">
        <Tabs value={tab} onValueChange={setTab} className="gap-6">
          <TabsList className="mx-auto gap-2 group-data-[orientation=horizontal]/tabs:h-[31px]">
            <TabsTrigger value="selection" className="pl-[3px] pr-2.5">
              <HugeiconsIcon icon={BrowserIcon} size={16} aria-hidden="true" />
              Design Audit
            </TabsTrigger>
            <TabsTrigger value="contrast" className="pl-[3px] pr-2.5">
              <HugeiconsIcon
                icon={PaintBoardIcon}
                size={16}
                aria-hidden="true"
              />
              Contrast Checker
            </TabsTrigger>
          </TabsList>
          <TabsContent value="contrast" className="min-w-0 space-y-6">
            <div className="space-y-2">
              <h2 className="text-sm font-medium">Check A Color Pair</h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Enter two colors to check their contrast. Changes here stay in
                this checker and do not edit Figma layers.
              </p>
            </div>
            <ContrastLevel
              value={level}
              onChange={(value) => {
                setLevel(value);
                setManualNotice("");
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: "foreground",
                  name: "Text Color",
                  value: foreground,
                  update: setForeground,
                },
                {
                  id: "background",
                  name: "Background",
                  value: background,
                  update: setBackground,
                },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="leading-5">
                    {field.name}
                  </Label>
                  <Input
                    id={field.id}
                    value={field.value}
                    onChange={(event) => {
                      field.update(event.target.value);
                      setManualNotice("");
                    }}
                    aria-invalid={!parseHex(field.value)}
                    aria-describedby={
                      !parseHex(field.value) ? "color-error" : undefined
                    }
                    spellCheck={false}
                    autoComplete="off"
                    className="h-8 min-w-0 px-2 text-xs md:text-xs shadow-none"
                  />{" "}
                </div>
              ))}
            </div>
            {ratio === null && (
              <p
                id="color-error"
                role="alert"
                className="text-xs text-destructive"
              >
                Enter a 3- or 6-digit HEX color, such as #6366F1.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setManualNotice("");
                setForeground(background);
                setBackground(foreground);
              }}
            >
              Swap Colors
            </Button>
            <section
              aria-label="Contrast Results"
              className="rounded-xl border p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Contrast Ratio
                </span>
                <strong className="text-2xl tabular-nums">
                  {ratio === null ? "—" : `${ratio.toFixed(2)}:1`}
                </strong>
              </div>
              <div className="space-y-3">
                {statuses.map(({ name, required }) => (
                  <div
                    key={name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span>
                      {name}{" "}
                      <span className="text-muted-foreground">
                        · {required}:1
                      </span>
                    </span>
                    <span
                      className={`rounded px-2 py-1 font-medium ${ratio === null ? "" : ratio >= required ? "result-pass" : "result-fail"}`}
                    >
                      {ratio === null
                        ? "—"
                        : ratio >= required
                          ? "Pass"
                          : "Fail"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            {ratio !== null && fg && bg && ratio < required && (
              <FindingCard
                finding={{
                  id: "manual",
                  name: "Normal Text",
                  category: "contrast",
                  status: "fail",
                  ratio,
                  required,
                  foreground: toHex(fg),
                  background: toHex(bg),
                  fixColor: manualFix,
                  detail:
                    "This text may be difficult to read against its background.",
                  suggestion:
                    "Increase contrast to meet the selected text threshold.",
                }}
                onFix={() => {
                  if (manualFix) {
                    setForeground(manualFix);
                    setManualNotice(
                      "Text Color adjusted to meet the selected contrast threshold.",
                    );
                  }
                }}
              />
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              Large Text: 24 px regular or 18.67 px bold. UI Components use the
              AA 3:1 threshold. Results use unrounded ratios.
            </p>
            <p
              role="status"
              aria-live="polite"
              className={
                manualNotice ? "text-xs text-muted-foreground" : "sr-only"
              }
            >
              {manualNotice}
            </p>
          </TabsContent>
          <TabsContent value="selection" className="min-w-0 space-y-6">
            <div className="space-y-2">
              <h2 className="text-sm font-medium">
                Audit Your Figma Selection
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Select one frame or layer, check it, then review findings. Fix
                Color applies to the Figma layer and can be undone.
              </p>
            </div>
            {!connected && (
              <p className="rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                {inFigma
                  ? "Connecting to Figma… Reopen the plugin if your selection does not appear."
                  : "Browser Preview · Figma selections appear only in the plugin opened inside Figma."}
              </p>
            )}
            <ContrastLevel
              value={auditLevel}
              disabled={busy}
              onChange={(value) => {
                setAuditLevel(value);
                setCheckComplete(false);
                setFindings(null);
                setFilter("all");
                setCategory("all");
                setNotice(
                  count
                    ? "Contrast level changed. Click Check to refresh results."
                    : "",
                );
              }}
            />
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-[13px] font-medium leading-6 text-foreground">
                Check contrast, font size, touch targets, heading hierarchy and
                text readability in selected layers. Hidden layers are excluded.
              </p>
              <Button
                className="mt-4 w-full"
                disabled={!connected || count !== 1 || busy}
                onClick={() => {
                  setBusy(true);
                  setCheckComplete(false);
                  setNotice("");
                  setFilter("all");
                  setCategory("all");
                  send({ type: "scan", level: auditLevel });
                }}
              >
                {busy ? "Checking…" : "Check"}
              </Button>
              {(!inFigma || count !== 1) && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {!inFigma
                    ? "Open this plugin in Figma to scan layers."
                    : count > 1
                      ? "Select only one frame or layer to check."
                      : !count
                        ? "Select a frame or text layer to begin."
                        : ""}
                </p>
              )}
            </div>
            <div
              role="status"
              aria-live="polite"
              className={
                notice
                  ? checkComplete
                    ? "result-pass flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs"
                    : "text-xs text-muted-foreground"
                  : "sr-only"
              }
            >
              {checkComplete && (
                <CheckIcon
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
              )}
              <div>
                <p className={checkComplete ? "font-medium" : undefined}>
                  {notice}
                </p>
                {checkComplete && (
                  <p className="mt-1">
                    {findings?.length ?? 0} findings. Review the results below.
                  </p>
                )}
              </div>
            </div>
            {findings && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="finding-status" className="text-xs">
                      Results
                    </Label>
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger
                        id="finding-status"
                        size="sm"
                        className="w-full text-xs"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Results</SelectItem>
                        <SelectItem value="fail">Failed</SelectItem>
                        <SelectItem value="review">Needs Review</SelectItem>
                        <SelectItem value="pass">Passed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="finding-category" className="text-xs">
                      Check Type
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger
                        id="finding-category"
                        size="sm"
                        className="w-full text-xs"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Checks</SelectItem>
                        {Object.entries(categoryNames).map(([value, name]) => (
                          <SelectItem key={value} value={value}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {findings.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No findings in this selection. This does not certify
                    accessibility compliance.
                  </p>
                )}
                {findings
                  .filter(
                    (finding) =>
                      (filter === "all" || finding.status === filter) &&
                      (category === "all" || finding.category === category),
                  )
                  .map((finding, index) => (
                    <FindingCard
                      key={finding.id + "-" + finding.category + "-" + index}
                      finding={finding}
                      busy={busy}
                      onFocus={() => send({ type: "focus", id: finding.id })}
                      onFix={() => {
                        setBusy(true);
                        setCheckComplete(false);
                        setNotice("");
                        send(
                          finding.fixAction
                            ? {
                                type: "fix-typography",
                                id: finding.id,
                                action: finding.fixAction,
                              }
                            : { type: "fix-color", id: finding.id },
                        );
                      }}
                    />
                  ))}
                {findings.length > 0 &&
                  !findings.some(
                    (finding) =>
                      (filter === "all" || finding.status === filter) &&
                      (category === "all" || finding.category === category),
                  ) && (
                    <p className="text-xs text-muted-foreground">
                      No findings match these filters.
                    </p>
                  )}
              </>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              Font size and readability are design guidance. Touch targets are
              inferred from names or prototype interactions; headings use H1–H6
              layer names and layer order. These checks require context and do
              not certify WCAG compliance.
            </p>
          </TabsContent>
        </Tabs>
      </main>
      <Footer dark={dark} onToggleTheme={() => setDark((value) => !value)} />
    </div>
  );
}
