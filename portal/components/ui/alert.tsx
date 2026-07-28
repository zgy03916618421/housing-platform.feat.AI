import { cn } from "@/lib/utils";

type Variant = "error" | "info";

const VARIANT_STYLES: Record<Variant, string> = {
  error:
    "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300",
};

type AlertProps = {
  variant?: Variant;
  title: string;
  description?: string;
  className?: string;
};

/** 提示条：error 用 role="alert"（即时播报），info 用 role="status" */
export function Alert({
  variant = "info",
  title,
  description,
  className,
}: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border p-4 text-sm",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      <p className="font-medium">{title}</p>
      {description ? <p className="mt-1 opacity-90">{description}</p> : null}
    </div>
  );
}
