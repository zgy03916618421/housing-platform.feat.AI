"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

/**
 * 根级错误边界：替换整个根布局，必须自带 <html>/<body>。
 * 全局样式可能不可用，这里使用内联样式兜底。
 */
export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          maxWidth: "36rem",
          margin: "0 auto",
          padding: "4rem 1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>应用出现严重错误</h1>
        <p role="alert" style={{ marginTop: "0.75rem", color: "#b91c1c" }}>
          {error.message || "发生未预期错误，请重试。"}
        </p>
        <button
          onClick={() => unstable_retry()}
          style={{
            marginTop: "1.5rem",
            borderRadius: "0.375rem",
            backgroundColor: "#4f46e5",
            color: "#fff",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
          }}
        >
          重试
        </button>
      </body>
    </html>
  );
}
