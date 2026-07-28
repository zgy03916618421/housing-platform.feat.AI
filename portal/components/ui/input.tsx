import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

/** 文本输入框：与 Label 配套使用（id/htmlFor 关联），无效时用 aria-invalid 标注 */
export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm",
        "placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600",
        "aria-invalid:border-red-500 aria-invalid:focus-visible:outline-red-600",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
