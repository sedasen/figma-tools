import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof HugeiconsIcon>, "icon">;
export const ChevronDownIcon = (props: Props) => (
  <HugeiconsIcon icon={ArrowDown01Icon} {...props} />
);
export const ChevronUpIcon = (props: Props) => (
  <HugeiconsIcon icon={ArrowUp01Icon} {...props} />
);
export const CheckIcon = (props: Props) => (
  <HugeiconsIcon icon={Tick02Icon} {...props} />
);
