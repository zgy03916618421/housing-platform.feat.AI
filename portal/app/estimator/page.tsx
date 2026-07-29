import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Property Value Estimator",
};

export default function EstimatorPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Property Value Estimator
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Enter property features and get a price estimate from the ML
          regression model.
        </p>
      </div>
      <Alert
        variant="info"
        title="Under construction"
        description="The estimate form, result charts, history, and comparison view will be implemented in Phase 3. The backend API is ready (app1-backend, port 8001)."
      />
    </div>
  );
}
