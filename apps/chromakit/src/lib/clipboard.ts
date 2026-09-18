/** Figma's sandbox may deny Clipboard API access; use a synchronous selection fallback. */
export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* Try the iframe-compatible fallback. */
    }
  }
  const active = document.activeElement;
  const selection = document.getSelection();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, i) =>
        selection.getRangeAt(i).cloneRange(),
      )
    : [];
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
  document.body.append(textarea);
  textarea.select();
  try {
    if (!document.execCommand("copy"))
      throw new Error("Copy failed. Select and copy the value manually.");
  } finally {
    textarea.remove();
    if (active instanceof HTMLElement) active.focus();
    selection?.removeAllRanges();
    ranges.forEach((range) => selection?.addRange(range));
  }
}
