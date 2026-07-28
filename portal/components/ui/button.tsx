import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500",
  secondary:
    "bg-zinc-100 text-foreground hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700",
  ghost: "text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

/** 基础按钮：统一焦点环（WCAG 2.4.7）与禁用态 */
export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_STYLES[variant],
        className,
      )}
      {...props}
    />
  );
}
