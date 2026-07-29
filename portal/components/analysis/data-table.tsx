"use client";

// 可排序/筛选的数据表：点击表头循环 升序→降序→默认（aria-sort 标注）
// 过滤栏：bedrooms 等值 + price/year_built 区间 + school_rating 下限，
// 全部客户端过滤（数据集仅 50 行已全量加载），导出跟随过滤后的当前视图
import { useMemo, useState } from "react";
import { ExportButtons } from "@/components/analysis/export-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

/** 区间过滤值：空字符串 = 无界 */
type RangeFilter = { min: string; max: string };

const EMPTY_RANGE: RangeFilter = { min: "", max: "" };

export function DataTable({ properties }: { properties: DatasetProperty[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);
  const [bedroomFilter, setBedroomFilter] = useState<number | "all">("all");
  const [priceRange, setPriceRange] = useState<RangeFilter>(EMPTY_RANGE);
  const [yearRange, setYearRange] = useState<RangeFilter>(EMPTY_RANGE);
  const [schoolMin, setSchoolMin] = useState("");

  const bedroomOptions = useMemo(
    () => [...new Set(properties.map((p) => p.bedrooms))].sort((a, b) => a - b),
    [properties],
  );

  // 数据集实际极值，用作区间输入的 placeholder 提示
  const bounds = useMemo(
    () => ({
      priceMin: Math.min(...properties.map((p) => p.price)),
      priceMax: Math.max(...properties.map((p) => p.price)),
      yearMin: Math.min(...properties.map((p) => p.year_built)),
      yearMax: Math.max(...properties.map((p) => p.year_built)),
    }),
    [properties],
  );

  const hasActiveFilter =
    bedroomFilter !== "all" ||
    priceRange.min !== "" ||
    priceRange.max !== "" ||
    yearRange.min !== "" ||
    yearRange.max !== "" ||
    schoolMin !== "";

  const rows = useMemo(() => {
    const filtered = properties.filter((p) => {
      if (bedroomFilter !== "all" && p.bedrooms !== bedroomFilter) return false;
      if (priceRange.min !== "" && p.price < Number(priceRange.min))
        return false;
      if (priceRange.max !== "" && p.price > Number(priceRange.max))
        return false;
      if (yearRange.min !== "" && p.year_built < Number(yearRange.min))
        return false;
      if (yearRange.max !== "" && p.year_built > Number(yearRange.max))
        return false;
      if (schoolMin !== "" && p.school_rating < Number(schoolMin))
        return false;
      return true;
    });
    if (!sort) return filtered;
    const { key, dir } = sort;
    return [...filtered].sort((a, b) =>
      dir === "asc" ? a[key] - b[key] : b[key] - a[key],
    );
  }, [properties, sort, bedroomFilter, priceRange, yearRange, schoolMin]);

  function cycleSort(key: SortKey) {
    setSort((current) => {
      if (current?.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return null; // 第三次点击：恢复默认顺序
    });
  }

  function resetFilters() {
    setBedroomFilter("all");
    setPriceRange(EMPTY_RANGE);
    setYearRange(EMPTY_RANGE);
    setSchoolMin("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
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
              className="block w-24 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="all">All</option>
              {bedroomOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price-min">Price range</Label>
            <div className="flex items-center gap-2">
              {/* 宽度放在包裹 div 上：Input 默认 w-full，cn() 无 tailwind-merge，直接传宽度类会被覆盖 */}
              <div className="w-24">
                <Input
                  id="price-min"
                  type="number"
                  min={0}
                  aria-label="Minimum price"
                  placeholder={formatNumber(bounds.priceMin)}
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((r) => ({ ...r, min: e.target.value }))
                  }
                />
              </div>
              <span aria-hidden="true" className="text-zinc-400">
                –
              </span>
              <div className="w-24">
                <Input
                  id="price-max"
                  type="number"
                  min={0}
                  aria-label="Maximum price"
                  placeholder={formatNumber(bounds.priceMax)}
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((r) => ({ ...r, max: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year-min">Year built</Label>
            <div className="flex items-center gap-2">
              <div className="w-20">
                <Input
                  id="year-min"
                  type="number"
                  aria-label="Earliest year built"
                  placeholder={String(bounds.yearMin)}
                  value={yearRange.min}
                  onChange={(e) =>
                    setYearRange((r) => ({ ...r, min: e.target.value }))
                  }
                />
              </div>
              <span aria-hidden="true" className="text-zinc-400">
                –
              </span>
              <div className="w-20">
                <Input
                  id="year-max"
                  type="number"
                  aria-label="Latest year built"
                  placeholder={String(bounds.yearMax)}
                  value={yearRange.max}
                  onChange={(e) =>
                    setYearRange((r) => ({ ...r, max: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="school-min">Min. school rating</Label>
            <div className="w-24">
              <Input
                id="school-min"
                type="number"
                min={0}
                max={10}
                step={0.1}
                placeholder="0–10"
                value={schoolMin}
                onChange={(e) => setSchoolMin(e.target.value)}
              />
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={resetFilters}
            disabled={!hasActiveFilter}
          >
            Reset filters
          </Button>

          {/* 与过滤组相同的「标签 + 控件」结构：换行时作为整体移动，底部基线对齐 */}
          <div className="ml-auto space-y-1.5">
            <span className="block text-sm font-medium text-foreground">
              Export
            </span>
            <ExportButtons properties={rows} />
          </div>
        </div>
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
