/** 后端服务地址（浏览器侧访问；可用 NEXT_PUBLIC_ 环境变量覆盖） */
export const APP1_API_URL =
  process.env.NEXT_PUBLIC_APP1_API_URL ?? "http://localhost:8001";

export const APP2_API_URL =
  process.env.NEXT_PUBLIC_APP2_API_URL ?? "http://localhost:8080";

/**
 * RSC 服务端访问地址（仅服务端可读，不内联进浏览器 bundle）。
 * compose 中指向内部服务名（http://app1-backend:8001），本地缺省同浏览器地址。
 */
export const APP1_API_URL_SERVER =
  process.env.APP1_API_URL_SERVER ?? APP1_API_URL;

export const APP2_API_URL_SERVER =
  process.env.APP2_API_URL_SERVER ?? APP2_API_URL;
