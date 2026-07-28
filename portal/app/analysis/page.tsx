import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "房产市场分析",
};

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">房产市场分析</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          市场可视化、分段筛选与 what-if 情景分析。
        </p>
      </div>
      <Alert
        variant="info"
        title="功能建设中"
        description="分析仪表盘与 Spring Boot 后端将在 Phase 4 实现。"
      />
    </div>
  );
}
