"use client";

// 单属性输入表单：react-hook-form + zod，客户端校验规则与后端 Pydantic 约束同步
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PROPERTY_FIELDS,
  propertySchema,
  type PropertyFeatures,
} from "@/lib/schemas/property";

export const SAMPLE_PROPERTY: PropertyFeatures = {
  square_footage: 1550,
  bedrooms: 3,
  bathrooms: 2.5,
  year_built: 1997,
  lot_size: 6800,
  distance_to_city_center: 4.1,
  school_rating: 7.6,
};

type PropertyFormProps = {
  onSubmit: (values: PropertyFeatures) => void;
  submitting?: boolean;
};

export function PropertyForm({ onSubmit, submitting }: PropertyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFeatures>({
    resolver: zodResolver(propertySchema),
    defaultValues: SAMPLE_PROPERTY,
    mode: "onBlur",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {PROPERTY_FIELDS.map((field) => {
          const error = errors[field.name];
          const errorId = `${field.name}-error`;
          return (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name}>
                {field.label}
                {field.hint ? (
                  <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                    ({field.hint})
                  </span>
                ) : null}
              </Label>
              <Input
                id={field.name}
                type="number"
                step={field.step}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                {...register(field.name, { valueAsNumber: true })}
              />
              {error ? (
                <p
                  id={errorId}
                  className="text-xs text-red-600 dark:text-red-400"
                >
                  {error.message}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Estimating…" : "Estimate value"}
      </Button>
    </form>
  );
}
