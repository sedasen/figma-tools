import { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState<ColorFormat>("HEX");
  const [input, setInput] = useState("#6366F1");
  const [color, setColor] = useState<Color>(INITIAL_COLOR);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState("values");
  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.parent === window) return;

    let previousHeight = 0;
    const resize = () => {
      const height = Math.ceil(container.getBoundingClientRect().height);
      if (height <= 0 || height === previousHeight) return;
      previousHeight = height;
      window.parent.postMessage(
        { pluginMessage: { type: "resize", height } },
        "*",
      );
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    return () => observer.disconnect();
  }, []);
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
    <div
      ref={containerRef}
      className="mx-auto flex w-full max-w-[512px] flex-col bg-background"
    >
      <h1 className="sr-only">ChromaKit</h1>
      <main className="flex flex-col gap-6 p-6">
        <section aria-label="Color converter" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="color" className="leading-5">
              Color
            </Label>
            <div className="flex items-center">
              <FormatSelect
                value={source}
                onChange={changeSource}
                label="Color format"
              />
              <Input
                id="color"
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
        </section>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
          <TabsList className="mx-auto gap-2 group-data-[orientation=horizontal]/tabs:h-[31px]">
            <TabsTrigger value="values" className="pl-[3px] pr-2.5">
              <HugeiconsIcon icon={BrowserIcon} size={16} />
              Converted Values
            </TabsTrigger>
            <TabsTrigger value="code" className="pl-[3px] pr-2.5">
              <HugeiconsIcon icon={CodeIcon} size={16} />
              Code
            </TabsTrigger>
          </TabsList>
          <div className="grid">
            <TabsContent
              value="values"
              forceMount
              aria-hidden={activeTab !== "values"}
              inert={activeTab !== "values"}
              className="[grid-area:1/1] data-[state=inactive]:pointer-events-none data-[state=inactive]:opacity-0"
            >
              <ConvertedValues color={validColor} onStatus={setStatus} />
            </TabsContent>
            <TabsContent value="code" className="min-w-0 [grid-area:1/1]">
              <CodeOutput
                color={validColor}
                target={source}
                onStatus={setStatus}
              />
            </TabsContent>
          </div>
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
