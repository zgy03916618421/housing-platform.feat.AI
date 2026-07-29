// Dashboard（RSC）：服务端加载总览 + 全量数据 + 默认分段，客户端组件负责维度切换
import type { Metadata } from "next";
import { KpiCards } from "@/components/analysis/kpi-cards";
import { PriceCharts } from "@/components/analysis/price-charts";
import { SegmentChart } from "@/components/analysis/segment-chart";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { getOverview, getProperties, getSegments } from "@/lib/api/analysis";
import { toApiError, type ApiError } from "@/lib/api/client";
import { APP2_API_URL_SERVER } from "@/lib/config";
import type { DatasetProperty, OverviewStats, SegmentStat } from "@/lib/types";

export const metadata: Metadata = {
  title: "Market dashboard",
};

export default async function AnalysisDashboardPage() {
  // RSC 初始数据加载：任一失败都降级为错误提示（后端可能未启动）
  let overview: OverviewStats | null = null;
  let properties: DatasetProperty[] | null = null;
  let segments: SegmentStat[] | null = null;
  let error: ApiError | null = null;
  try {
    [overview, properties, segments] = await Promise.all([
      getOverview(APP2_API_URL_SERVER),
      getProperties(APP2_API_URL_SERVER),
      getSegments("bedrooms", APP2_API_URL_SERVER),
    ]);
  } catch (err) {
    error = toApiError(err);
  }

  if (error || !overview || !properties || !segments) {
    return (
      <Alert
        variant="error"
        title="Could not load market data"
        description={`${error?.message ?? "An unexpected error occurred."} Make sure app2-backend is running (port 8080).`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <KpiCards stats={overview} />
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Average price by segment</h2>
        <SegmentChart initialBy="bedrooms" initialData={segments} />
      </Card>
      <Card>
        <PriceCharts properties={properties} />
      </Card>
    </div>
  );
}
