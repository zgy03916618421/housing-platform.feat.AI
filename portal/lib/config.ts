/** 后端服务地址（浏览器侧访问；可用 NEXT_PUBLIC_ 环境变量覆盖） */
export const APP1_API_URL =
  process.env.NEXT_PUBLIC_APP1_API_URL ?? "http://localhost:8001";

export const APP2_API_URL =
  process.env.NEXT_PUBLIC_APP2_API_URL ?? "http://localhost:8080";
