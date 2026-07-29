// App 2 分区布局：标题 + 子导航（Dashboard / What-if / Data）
import { AnalysisNav } from "@/components/analysis/analysis-nav";

export default function AnalysisLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Property Market Analysis
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Explore market statistics from the housing dataset, run what-if
          scenarios against the ML model, and export the data.
        </p>
      </div>
      <AnalysisNav />
      {children}
    </div>
  );
}
