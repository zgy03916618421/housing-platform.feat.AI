import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Property Market Analysis",
};

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Property Market Analysis
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Market visualizations, segment filters, and what-if analysis.
        </p>
      </div>
      <Alert
        variant="info"
        title="Under construction"
        description="The analysis dashboard and the Spring Boot backend will be implemented in Phase 4."
      />
    </div>
  );
}
