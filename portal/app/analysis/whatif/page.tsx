// What-if 页（RSC）：服务端加载统计基线（失败降级为无基线，表单仍可用）
import type { Metadata } from "next";
import { WhatIfClient } from "@/components/analysis/whatif-client";
import { getOverview, getSegments } from "@/lib/api/analysis";
import { APP2_API_URL_SERVER } from "@/lib/config";
import type { OverviewStats, SegmentStat } from "@/lib/types";

export const metadata: Metadata = {
  title: "What-if analysis",
};

export default async function WhatIfPage() {
  let overview: OverviewStats | null = null;
  let bedroomSegments: SegmentStat[] | null = null;
  try {
    [overview, bedroomSegments] = await Promise.all([
      getOverview(APP2_API_URL_SERVER),
      getSegments("bedrooms", APP2_API_URL_SERVER),
    ]);
  } catch {
    // 统计基线不可用时降级：预测功能仍可用，仅不展示对比
  }

  return <WhatIfClient overview={overview} bedroomSegments={bedroomSegments} />;
}
