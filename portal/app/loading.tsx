import { Spinner } from "@/components/ui/spinner";

/** 布局级加载态：Next 自动以此包裹路由 Suspense 边界 */
export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner label="Loading page" />
    </div>
  );
}
