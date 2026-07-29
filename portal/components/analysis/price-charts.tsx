"use client";

// 价格分布直方图 + 面积-价格散点图（基于全量 50 行数据客户端计算）
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency, formatCurrency, formatNumber } from "@/lib/format";
import type { DatasetProperty } from "@/lib/types";

const BUCKET_SIZE = 50_000;

function buildHistogram(properties: DatasetProperty[]) {
  const buckets = new Map<number, number>();
  for (const p of properties) {
    const bucket = Math.floor(p.price / BUCKET_SIZE) * BUCKET_SIZE;
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([bucket, count]) => ({
      range: `${formatCompactCurrency(bucket)}–${formatCompactCurrency(bucket + BUCKET_SIZE)}`,
      count,
    }));
}

export function PriceCharts({ properties }: { properties: DatasetProperty[] }) {
  const histogram = buildHistogram(properties);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Price distribution</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogram} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [value, "Listings"]} />
              <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Size vs. price</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="square_footage"
                name="Size"
                tickLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatNumber(Number(v))}
              />
              <YAxis
                type="number"
                dataKey="price"
                name="Price"
                width={72}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCompactCurrency(Number(v))}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value, name) =>
                  name === "Price"
                    ? [formatCurrency(Number(value)), "Price"]
                    : [`${formatNumber(Number(value))} sqft`, "Size"]
                }
              />
              <Scatter data={properties} fill="#4f46e5" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
