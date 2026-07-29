// 估算主页（RSC）：服务端加载模型指标作为初始数据，表单交互在客户端组件中
import type { Metadata } from "next";
import { EstimatorClient } from "@/components/estimator/estimator-client";
import { ModelInfoCard } from "@/components/estimator/model-info-card";
import { Alert } from "@/components/ui/alert";
import { getModelInfo } from "@/lib/api/estimates";
import { APP1_API_URL_SERVER } from "@/lib/config";
import type { ModelInfo } from "@/lib/types";

export const metadata: Metadata = {
  title: "New estimate",
};

export default async function EstimatorPage() {
  // RSC 初始数据加载：失败不阻塞表单使用
  let info: ModelInfo | null = null;
  try {
    info = await getModelInfo(APP1_API_URL_SERVER);
  } catch {
    info = null;
  }

  return (
    <div className="space-y-6">
      {info ? (
        <ModelInfoCard info={info} />
      ) : (
        <Alert
          variant="info"
          title="Model metrics unavailable"
          description="Could not load model info from the backend. You can still submit estimates."
        />
      )}
      <EstimatorClient />
    </div>
  );
}
