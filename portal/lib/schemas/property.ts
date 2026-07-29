// 属性特征 zod schema：与 app1-backend 的 Pydantic 约束保持同步（7 字段）
// 后端是最终权威（见 app1-backend/app/schemas/request.py），此处为客户端先行校验
import { z } from "zod";

const CURRENT_YEAR = new Date().getFullYear();

/** 数值字段公共前缀：空输入（NaN）统一报 "Required" */
const num = (label: string) =>
  z.number({ invalid_type_error: `${label} is required` });

export const propertySchema = z.object({
  square_footage: num("Square footage")
    .int("Must be a whole number")
    .gt(0, "Must be greater than 0"),
  bedrooms: num("Bedrooms")
    .int("Must be a whole number")
    .min(1, "Must be at least 1")
    .max(20, "Must be at most 20"),
  bathrooms: num("Bathrooms")
    .min(0.5, "Must be at least 0.5")
    .max(20, "Must be at most 20"),
  year_built: num("Year built")
    .int("Must be a whole number")
    .min(1800, "Must be 1800 or later")
    .max(CURRENT_YEAR, `Cannot be later than ${CURRENT_YEAR}`),
  lot_size: num("Lot size")
    .int("Must be a whole number")
    .gt(0, "Must be greater than 0"),
  distance_to_city_center: num("Distance to city center").min(
    0,
    "Cannot be negative",
  ),
  school_rating: num("School rating")
    .min(0, "Must be between 0 and 10")
    .max(10, "Must be between 0 and 10"),
});

export type PropertyFeatures = z.infer<typeof propertySchema>;

/** 表单与展示共用的字段元数据（顺序即表单/表格展示顺序） */
export const PROPERTY_FIELDS: Array<{
  name: keyof PropertyFeatures;
  label: string;
  hint?: string;
  step?: string;
}> = [
  { name: "square_footage", label: "Square footage", hint: "sqft", step: "1" },
  { name: "bedrooms", label: "Bedrooms", step: "1" },
  { name: "bathrooms", label: "Bathrooms", step: "0.5" },
  { name: "year_built", label: "Year built", step: "1" },
  { name: "lot_size", label: "Lot size", hint: "sqft", step: "1" },
  {
    name: "distance_to_city_center",
    label: "Distance to city center",
    hint: "miles",
    step: "0.1",
  },
  { name: "school_rating", label: "School rating", hint: "0–10", step: "0.1" },
];
