"use client";

// 预测结果柱状图（recharts）
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

export type ChartDatum = { name: string; prediction: number };

export function PredictionChart({ data }: { data: ChartDatum[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} />
          <YAxis
            width={72}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCompactCurrency(Number(v))}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), "Estimate"]}
          />
          <Bar dataKey="prediction" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
