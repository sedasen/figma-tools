import type { Color } from "culori";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@figma-tools/ui/components/tabs";
import { CopyButton } from "./copy-button";
import { CODE_FORMATS, generateCode } from "@/lib/code";
import type { ColorFormat } from "@/lib/colors";
import { HighlightedCode } from "./highlighted-code";

export function CodeOutput({
  color,
  target,
  onStatus,
}: {
  color: Color | null;
  target: ColorFormat;
  onStatus: (message: string) => void;
}) {
  return (
    <Tabs defaultValue="CSS" className="gap-6">
      <TabsList
        variant="line"
        className="mx-auto max-w-full group-data-[orientation=horizontal]/tabs:h-[29px]"
      >
        {CODE_FORMATS.map((language) => (
          <TabsTrigger
            key={language}
            value={language}
            className="px-2.5 max-[420px]:px-1 max-[420px]:text-xs"
          >
            {language}
          </TabsTrigger>
        ))}
      </TabsList>
      {CODE_FORMATS.map((language) => {
        const code = color ? generateCode(color, target, language) : "";
        return (
          <TabsContent key={language} value={language} className="space-y-3">
            <div className="relative rounded-lg border bg-muted/50 p-4 pr-24">
              <pre
                className="overflow-x-auto text-xs leading-6"
                tabIndex={0}
                aria-label={`${language} code`}
              >
                {code ? (
                  <HighlightedCode code={code} language={language} />
                ) : (
                  <code>Enter a valid color to generate code.</code>
                )}
              </pre>
              <div className="absolute right-2 top-2">
                <CopyButton
                  label={`${language} code`}
                  value={code}
                  disabled={!color}
                  showLabel
                  onStatus={onStatus}
                />
              </div>
            </div>
            {language !== "JSON" && (target === "HSB" || target === "CMYK") && (
              <p className="text-xs text-muted-foreground">
                {target} is exported as RGB for CSS compatibility.
              </p>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
