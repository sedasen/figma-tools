import { useEffect, useState } from "react";
import type { Color } from "culori";
import { HugeiconsIcon } from "@hugeicons/react";
import { CodeIcon, BrowserIcon } from "@hugeicons/core-free-icons";
import { Input } from "@figma-tools/ui/components/input";
import { Label } from "@figma-tools/ui/components/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@figma-tools/ui/components/tabs";
import { FormatSelect } from "@/components/format-select";
import { ColorPicker } from "@/components/color-picker";
import { CopyButton } from "@/components/copy-button";
import { ConvertedValues } from "@/components/converted-values";
import { CodeOutput } from "@/components/code-output";
import { Footer } from "@/components/footer";
import {
  EXAMPLES,
  isOutsideSrgb,
  parseColor,
  serializeColor,
  type ColorFormat,
} from "@/lib/colors";

const INITIAL_COLOR = parseColor("#6366F1", "HEX");

export default function App() {
  const [source, setSource] = useState<ColorFormat>("HEX");
  const [target, setTarget] = useState<ColorFormat>("OKLCH");
  const [input, setInput] = useState("#6366F1");
  const [color, setColor] = useState<Color>(INITIAL_COLOR);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(""), 2500);
    return () => clearTimeout(timer);
  }, [status]);
  const validColor = error ? null : color;
  const output = validColor ? serializeColor(validColor, target) : "";

  function updateInput(value: string) {
    setInput(value);
    setStatus("");
    try {
      setColor(parseColor(value, source));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enter a valid color.");
    }
  }
  function changeSource(format: ColorFormat) {
    setSource(format);
    if (!error) setInput(serializeColor(color, format));
    else {
      try {
        setColor(parseColor(input, format));
        setError("");
      } catch {
        setError(`Enter a valid ${format} value. Example: ${EXAMPLES[format]}`);
      }
    }
  }
  function pickColor(next: Color) {
    setColor(next);
    setInput(serializeColor(next, source));
    setError("");
  }
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[512px] flex-col bg-background">
      <h1 className="sr-only">ChromaKit</h1>
      <main className="flex flex-col gap-6 p-6">
        <section aria-label="Color converter" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="from-color" className="leading-5">
              From
            </Label>
            <div className="flex items-center">
              <FormatSelect
                value={source}
                onChange={changeSource}
                label="From format"
              />
              <Input
                id="from-color"
                value={input}
                onChange={(event) => updateInput(event.target.value)}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={!!error}
                aria-describedby={error ? "color-error" : undefined}
                placeholder={EXAMPLES[source]}
                className="-mx-px h-8 min-w-0 rounded-none px-2 text-xs md:text-xs shadow-none focus-visible:ring-0 focus-visible:border-input"
              />
              <ColorPicker color={color} onChange={pickColor} />
            </div>
            {error && (
              <p
                id="color-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {error}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="to-color" className="leading-5">
              To
            </Label>
            <div className="flex items-center">
              <FormatSelect
                value={target}
                onChange={setTarget}
                label="To format"
              />
              <div className="relative -ml-px h-8 min-w-0 flex-1">
                <Input
                  id="to-color"
                  value={output}
                  readOnly
                  placeholder="—"
                  aria-label="Converted color"
                  className="h-full min-w-0 rounded-l-none pl-2 pr-9 text-xs md:text-xs shadow-none focus-visible:ring-0 focus-visible:border-input"
                />
                <CopyButton
                  value={output}
                  label="converted color"
                  inline
                  disabled={!validColor}
                  onStatus={setStatus}
                />
              </div>
            </div>
          </div>
        </section>
        <Tabs defaultValue="values" className="gap-6">
          <TabsList className="mx-auto group-data-[orientation=horizontal]/tabs:h-[31px]">
            <TabsTrigger value="values" className="pl-[3px] pr-2.5">
              <HugeiconsIcon icon={BrowserIcon} size={16} />
              Converted Values
            </TabsTrigger>
            <TabsTrigger value="code" className="pl-[3px] pr-2.5">
              <HugeiconsIcon icon={CodeIcon} size={16} />
              Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="values">
            <ConvertedValues color={validColor} onStatus={setStatus} />
          </TabsContent>
          <TabsContent value="code">
            <CodeOutput
              color={validColor}
              target={target}
              onStatus={setStatus}
            />
          </TabsContent>
        </Tabs>
        {validColor && isOutsideSrgb(validColor) && (
          <p className="text-xs text-muted-foreground">
            Outside sRGB: preview, HEX, RGB, HSL, HSB and CMYK are clipped.
            OKLCH and LCH retain the source color.
          </p>
        )}
      </main>
      <Footer dark={dark} onToggleTheme={() => setDark((value) => !value)} />
      <p
        role="status"
        aria-live="polite"
        className={
          status
            ? "fixed bottom-3 left-1/2 z-50 max-w-[90%] -translate-x-1/2 rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md"
            : "sr-only"
        }
      >
        {status}
      </p>
    </div>
  );
}
