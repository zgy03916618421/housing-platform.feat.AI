"use client";

import { useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  /** Next 16.2+：重新获取并重渲染该路由段（优于仅清空错误态的 reset） */
  unstable_retry: () => void;
};

/** 布局级错误边界：渲染在根布局之内，保留导航可用 */
export default function Error({ error, unstable_retry }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16">
      <Alert
        variant="error"
        title="Something went wrong"
        description={error.message || "An unexpected error occurred. Please try again."}
      />
      <div className="mt-6 flex gap-3">
        <Button onClick={() => unstable_retry()}>Try again</Button>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
      {error.digest ? (
        <p className="mt-4 text-xs text-zinc-500">Error ID: {error.digest}</p>
      ) : null}
    </div>
  );
}
