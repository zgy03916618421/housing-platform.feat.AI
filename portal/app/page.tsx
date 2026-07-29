import Link from "next/link";
import { Card } from "@/components/ui/card";

const APPS = [
  {
    href: "/estimator",
    name: "Property Value Estimator",
    description:
      "Enter property features (area, bedrooms, year built, and more) to get a price estimate from the ML regression model. Includes estimate history and side-by-side comparison.",
    tag: "App 1 · FastAPI",
  },
  {
    href: "/analysis",
    name: "Property Market Analysis",
    description:
      "Market dashboard, segment filters, what-if analysis, and data export.",
    tag: "App 2 · Spring Boot",
  },
] as const;

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Property Portal</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Two independent apps powered by one ML housing-price model. Pick an
          app to get started.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {APPS.map((app) => (
          <Link
            key={app.href}
            href={app.href}
            className="group rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
          >
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {app.tag}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{app.name}</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {app.description}
              </p>
              <p className="mt-4 text-sm font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
                Open app →
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
