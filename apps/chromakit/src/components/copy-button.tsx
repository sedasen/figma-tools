import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@figma-tools/ui/components/button";
import { copyText } from "@/lib/clipboard";

interface Props {
  value: string;
  label: string;
  disabled?: boolean;
  compact?: boolean;
  showLabel?: boolean;
  inline?: boolean;
  onStatus: (message: string) => void;
}
export function CopyButton({
  value,
  label,
  disabled,
  compact,
  showLabel,
  inline,
  onStatus,
}: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await copyText(value);
      setCopied(true);
      onStatus(`${label} copied.`);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      onStatus(error instanceof Error ? error.message : "Unable to copy.");
    }
  }
  return (
    <Button
      type="button"
      variant={compact ? "outline" : "ghost"}
      size={showLabel ? "sm" : compact ? "icon-xs" : "icon-sm"}
      disabled={disabled}
      onClick={copy}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      className={
        inline
          ? "absolute right-px top-0 size-8 rounded-none border-0 bg-transparent shadow-none hover:bg-transparent dark:hover:bg-transparent hover:text-foreground focus-visible:ring-0 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-4"
          : undefined
      }
    >
      <HugeiconsIcon
        icon={copied ? Tick02Icon : Copy01Icon}
        size={16}
        aria-hidden="true"
      />
      {showLabel && (copied ? "Copied" : "Copy")}
    </Button>
  );
}
