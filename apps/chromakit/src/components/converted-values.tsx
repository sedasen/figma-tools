import type { Color } from "culori";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@figma-tools/ui/components/table";
import { CopyButton } from "./copy-button";
import { COLOR_FORMATS, serializeColor } from "@/lib/colors";

export function ConvertedValues({
  color,
  onStatus,
}: {
  color: Color | null;
  onStatus: (message: string) => void;
}) {
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[33.33%]">Type</TableHead>
          <TableHead>Value</TableHead>
          <TableHead className="w-9">
            <span className="sr-only">Copy</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {COLOR_FORMATS.map((format) => {
          const value = color ? serializeColor(color, format) : "";
          return (
            <TableRow key={format} className="h-[37px]">
              <TableCell className="py-1">{format}</TableCell>
              <TableCell className="py-1 pr-0">
                <span
                  className="block overflow-x-auto whitespace-nowrap text-[13px]"
                  tabIndex={0}
                  title={value}
                >
                  {value || "—"}
                </span>
              </TableCell>
              <TableCell className="py-1 pr-0 text-right">
                <CopyButton
                  compact
                  label={format}
                  value={value}
                  disabled={!color}
                  onStatus={onStatus}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
