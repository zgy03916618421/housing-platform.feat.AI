"use client";

// App 2 内部子导航：Dashboard / What-if / Data
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/analysis", label: "Dashboard", exact: true },
  { href: "/analysis/whatif", label: "What-if", exact: false },
  { href: "/analysis/data", label: "Data", exact: false },
] as const;

export function AnalysisNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Analysis sections"
      className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800"
    >
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
              active
                ? "border-indigo-600 text-indigo-700 dark:text-indigo-300"
                : "border-transparent text-zinc-600 hover:border-zinc-300 hover:text-foreground dark:text-zinc-400",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
