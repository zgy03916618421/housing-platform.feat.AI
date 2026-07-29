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

// ── App 2（Market Analysis）类型 ──

export type OverviewStats = {
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
  avgSquareFootage: number;
  avgSchoolRating: number;
};

export type SegmentStat = {
  segment: string;
  count: number;
  avgPrice: number;
  avgSquareFootage: number;
};

export type SegmentDimension =
  | "bedrooms"
  | "decade"
  | "school_band"
  | "distance_band";

/** 数据集中的一条房产记录（含 price，字段名与数据集一致） */
export type DatasetProperty = {
  id: number;
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
  price: number;
};

export type WhatIfResponse = {
  predictions: number[];
};
