import Link from "next/link";

/** 404：渲染在根布局之内，兜底所有未匹配 URL */
export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Back to home
      </Link>
    </div>
  );
}
