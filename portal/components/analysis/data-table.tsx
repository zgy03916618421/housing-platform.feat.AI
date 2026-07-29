"use client";

// 可排序/筛选的数据表：点击表头循环 升序→降序→默认（aria-sort 标注），bedrooms 下拉筛选
import { useMemo, useState } from "react";
import { ExportButtons } from "@/components/analysis/export-buttons";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DatasetProperty } from "@/lib/types";

type SortKey = keyof Omit<DatasetProperty, "id">;
type SortDir = "asc" | "desc";

const COLUMNS: Array<{
  key: SortKey;
  label: string;
  format: (v: number) => string;
}> = [
  { key: "price", label: "Price", format: formatCurrency },
  { key: "square_footage", label: "Sqft", format: formatNumber },
  { key: "bedrooms", label: "Bed", format: String },
  { key: "bathrooms", label: "Bath", format: String },
  { key: "year_built", label: "Year", format: String },
  { key: "lot_size", label: "Lot size", format: formatNumber },
  {
    key: "distance_to_city_center",
    label: "Dist. (mi)",
    format: String,
  },
  { key: "school_rating", label: "School", format: String },
];

export function DataTable({ properties }: { properties: DatasetProperty[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);
  const [bedroomFilter, setBedroomFilter] = useState<number | "all">("all");

  const bedroomOptions = useMemo(
    () => [...new Set(properties.map((p) => p.bedrooms))].sort((a, b) => a - b),
    [properties],
  );

  const rows = useMemo(() => {
    const filtered =
      bedroomFilter === "all"
        ? properties
        : properties.filter((p) => p.bedrooms === bedroomFilter);
    if (!sort) return filtered;
    const { key, dir } = sort;
    return [...filtered].sort((a, b) =>
      dir === "asc" ? a[key] - b[key] : b[key] - a[key],
    );
  }, [properties, sort, bedroomFilter]);

  function cycleSort(key: SortKey) {
    setSort((current) => {
      if (current?.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return null; // 第三次点击：恢复默认顺序
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="bedroom-filter">Bedrooms</Label>
          <select
            id="bedroom-filter"
            value={bedroomFilter}
            onChange={(e) =>
              setBedroomFilter(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All</option>
            {bedroomOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <ExportButtons properties={rows} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              {COLUMNS.map((col) => {
                const active = sort?.key === col.key;
                const ariaSort = active
                  ? sort.dir === "asc"
                    ? "ascending"
                    : "descending"
                  : undefined;
                return (
                  <th
                    key={col.key}
                    aria-sort={ariaSort}
                    className="px-4 py-2 text-left"
                  >
                    <button
                      type="button"
                      onClick={() => cycleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded text-xs font-medium uppercase tracking-wide",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                        active
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-zinc-500 hover:text-foreground dark:text-zinc-400",
                      )}
                    >
                      {col.label}
                      <span aria-hidden="true">
                        {active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                      <span className="sr-only">
                        {active
                          ? `(sorted ${sort.dir === "asc" ? "ascending" : "descending"})`
                          : "(not sorted)"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-2 text-sm",
                      col.key === "price" &&
                        "font-semibold text-indigo-700 dark:text-indigo-300",
                    )}
                  >
                    {col.key === "price"
                      ? col.format(p[col.key])
                      : col.key === "square_footage" || col.key === "lot_size"
                        ? col.format(p[col.key])
                        : p[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Showing {rows.length} of {properties.length} listings
        {sort ? ` · sorted by ${sort.key} (${sort.dir})` : ""} · export covers
        the current view.
      </p>
    </div>
  );
}
