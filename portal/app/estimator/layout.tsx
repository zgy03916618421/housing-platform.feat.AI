// App 1 分区布局：标题 + 子导航（New estimate / History / Compare）
import { EstimatorNav } from "@/components/estimator/estimator-nav";

export default function EstimatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Property Value Estimator
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Estimate property values with the ML regression model, review past
          estimates, and compare properties side by side.
        </p>
      </div>
      <EstimatorNav />
      {children}
    </div>
  );
}
