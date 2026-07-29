// Data 页（RSC）：服务端加载全量数据，客户端表格负责排序/筛选/导出
import type { Metadata } from "next";
import { DataTable } from "@/components/analysis/data-table";
import { Alert } from "@/components/ui/alert";
import { getProperties } from "@/lib/api/analysis";
import { toApiError, type ApiError } from "@/lib/api/client";
import { APP2_API_URL_SERVER } from "@/lib/config";
import type { DatasetProperty } from "@/lib/types";

export const metadata: Metadata = {
  title: "Market data",
};

export default async function DataPage() {
  let properties: DatasetProperty[] | null = null;
  let error: ApiError | null = null;
  try {
    properties = await getProperties(APP2_API_URL_SERVER);
  } catch (err) {
    error = toApiError(err);
  }

  if (error || !properties) {
    return (
      <Alert
        variant="error"
        title="Could not load property data"
        description={`${error?.message ?? "An unexpected error occurred."} Make sure app2-backend is running (port 8080).`}
      />
    );
  }

  return <DataTable properties={properties} />;
}
