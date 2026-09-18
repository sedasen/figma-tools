import { useEffect, useState } from "react";
import { converter, formatHex, type Color } from "culori";
import { HsvaColorPicker } from "react-colorful";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@figma-tools/ui/components/button";
import { Input } from "@figma-tools/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@figma-tools/ui/components/popover";
import { parseColor, srgb } from "@/lib/colors";

const toHsv = converter("hsv");

export function ColorPicker({
  color,
  onChange,
}: {
  color: Color;
  onChange: (color: Color) => void;
}) {
  const hex = formatHex(srgb(color));
  const alpha = color.alpha ?? 1;
  // Preserve the selected hue when saturation/value reach gray or black.
  const hsv = toHsv(color.mode === "hsv" ? color : srgb(color));
  const [draft, setDraft] = useState(hex);
  useEffect(() => setDraft(hex), [hex]);

  function updateHex(value: string) {
    setDraft(value);
    if (/^#?[\da-f]{6}$/i.test(value))
      onChange({ ...parseColor(value, "HEX"), alpha });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[70px] rounded-l-none shadow-none"
          aria-label="Open color picker"
        >
          <span className="h-5 w-7 overflow-hidden rounded-sm transparency-grid">
            <span
              className="block size-full"
              style={{ backgroundColor: hex, opacity: alpha }}
            />
          </span>
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="color-picker w-[248px] space-y-4 p-3"
        aria-label="Color picker"
      >
        <div className="relative">
          <HsvaColorPicker
            color={{ h: hsv.h ?? 0, s: hsv.s * 100, v: hsv.v * 100, a: alpha }}
            onChange={({ h, s, v, a }) =>
              onChange({ mode: "hsv", h, s: s / 100, v: v / 100, alpha: a })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-2 top-2 text-xs text-muted-foreground">
              HEX
            </span>
            <Input
              aria-label="Picker HEX"
              value={draft.toUpperCase()}
              onChange={(event) => updateHex(event.target.value)}
              onBlur={() => setDraft(hex)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setDraft(hex);
                  event.currentTarget.blur();
                }
              }}
              spellCheck={false}
              className="h-8 pl-10 text-xs md:text-xs"
            />
          </div>
          <div className="relative w-[62px]">
            <Input
              type="number"
              aria-label="Opacity percentage"
              min={0}
              max={100}
              step={1}
              value={Math.round(alpha * 100)}
              onChange={(event) => {
                const value = event.target.valueAsNumber;
                if (Number.isFinite(value))
                  onChange({
                    ...color,
                    alpha: Math.max(0, Math.min(100, value)) / 100,
                  });
              }}
              className="h-8 px-2 pr-5 text-xs md:text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="pointer-events-none absolute right-2 top-2 text-xs text-muted-foreground">
              %
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
