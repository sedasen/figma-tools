import { Button } from "@figma-tools/ui/components/button";

export function ContrastLevel({
  value,
  onChange,
  disabled = false,
}: {
  value: "AA" | "AAA";
  onChange: (value: "AA" | "AAA") => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">WCAG 2.2 Contrast</span>
      <div className="flex gap-1" role="group" aria-label="Contrast Level">
        {(["AA", "AAA"] as const).map((level) => (
          <Button
            key={level}
            size="sm"
            disabled={disabled}
            variant={value === level ? "default" : "outline"}
            className={`w-12 border transition-none ${value === level ? "border-transparent" : ""}`}
            aria-pressed={value === level}
            onClick={() => {
              if (level !== value) onChange(level);
            }}
          >
            {level}
          </Button>
        ))}
      </div>
    </div>
  );
}
