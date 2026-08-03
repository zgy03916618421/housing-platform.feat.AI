import { cn } from "@/lib/utils";

/** 骨架屏占位：配合 animate-pulse 提供加载时的页面结构预览 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800",
        className,
      )}
    />
  );
}
