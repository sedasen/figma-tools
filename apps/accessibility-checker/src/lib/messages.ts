export type Finding = {
  id: string;
  name: string;
  ratio?: number;
  required?: number;
  status: "pass" | "fail" | "review";
  detail: string;
  category?:
    "contrast" | "font-size" | "touch-target" | "heading" | "readability";
  suggestion?: string;
  current?: string;
  recommended?: string;
  foreground?: string;
  background?: string;
  fixColor?: string;
  fixAction?: "font-size" | "line-height";
};
export type PluginResponse =
  | {
      type: "selection";
      count: number;
      nodes: { id: string; name: string; type: string }[];
    }
  | { type: "results"; findings: Finding[]; truncated: boolean }
  | { type: "error"; message: string };
