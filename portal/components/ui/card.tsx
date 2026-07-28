import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/** 卡片容器：统一圆角/边框/阴影，作为设计系统的基础容器 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
      {...props}
    />
  );
}
