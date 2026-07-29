// app1-backend API 的 TypeScript 类型镜像
import type { PropertyFeatures } from "@/lib/schemas/property";

export type EstimateRecord = {
  id: string;
  created_at: string;
  features: PropertyFeatures;
  prediction: number;
  batch_id: string;
};

export type EstimateBatchResponse = {
  batch_id: string;
  estimates: EstimateRecord[];
};

export type EstimateListResponse = {
  total: number;
  items: EstimateRecord[];
};

export type ModelInfo = {
  algorithm: string;
  r2_score: number;
  rmse: number;
  coefficients: number[];
  intercept: number;
};
