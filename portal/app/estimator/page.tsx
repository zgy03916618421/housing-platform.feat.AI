import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "房产价值估算",
};

export default function EstimatorPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">房产价值估算</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          输入属性特征，由 ML 回归模型估算房价。
        </p>
      </div>
      <Alert
        variant="info"
        title="功能建设中"
        description="估算表单、结果图表、历史记录与对比视图将在 Phase 3 实现，后端 API 已就绪（app1-backend，端口 8001）。"
      />
    </div>
  );
}
