// 对比页（RSC 壳 + 客户端交互组件）
import type { Metadata } from "next";
import { CompareClient } from "@/components/estimator/compare-client";

export const metadata: Metadata = {
  title: "Compare properties",
};

export default function ComparePage() {
  return <CompareClient />;
}
