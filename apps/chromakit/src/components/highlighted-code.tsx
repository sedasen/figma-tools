import { useMemo, type ReactNode } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-json";
import type { CodeFormat } from "@/lib/code";

const languages: Record<CodeFormat, string> = {
  CSS: "css",
  SCSS: "scss",
  Tailwind: "css",
  "React (JSX)": "jsx",
  JSON: "json",
};

function renderTokens(tokens: Array<string | Prism.Token>): ReactNode {
  return tokens.map((token, index) => {
    if (typeof token === "string") return token;
    const aliases =
      typeof token.alias === "string" ? [token.alias] : (token.alias ?? []);
    const content = Array.isArray(token.content)
      ? token.content
      : [token.content];
    return (
      <span key={index} className={["token", token.type, ...aliases].join(" ")}>
        {renderTokens(content)}
      </span>
    );
  });
}

export function HighlightedCode({
  code,
  language,
}: {
  code: string;
  language: CodeFormat;
}) {
  const tokens = useMemo(
    () => Prism.tokenize(code, Prism.languages[languages[language]]),
    [code, language],
  );
  return <code className="syntax-code">{renderTokens(tokens)}</code>;
}
