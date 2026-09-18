import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@figma-tools/ui/components/select";
import { COLOR_FORMATS, type ColorFormat } from "@/lib/colors";

export function FormatSelect({
  value,
  onChange,
  label,
}: {
  value: ColorFormat;
  onChange: (value: ColorFormat) => void;
  label: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(value) => onChange(value as ColorFormat)}
    >
      <SelectTrigger
        size="sm"
        className="w-[100px] shrink-0 rounded-r-none px-2.5 shadow-none"
        aria-label={label}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        {COLOR_FORMATS.map((format) => (
          <SelectItem key={format} value={format}>
            {format}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
