import { cn } from "@/lib/utils";
import type { LabelHTMLAttributes } from "react";

/** 表单标签：通过 htmlFor 与控件 id 关联（WCAG 1.3.1 / 3.3.2） */
export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}
