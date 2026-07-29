"use client";

// 对比工具：useFieldArray 管理 2–5 个属性，一次批量提交（复用后端数组契约）
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompareResults } from "@/components/estimator/compare-results";
import { SAMPLE_PROPERTY } from "@/components/estimator/property-form";
import { useEstimateSubmit } from "@/hooks/use-estimate-submit";
import {
  PROPERTY_FIELDS,
  propertySchema,
  type PropertyFeatures,
} from "@/lib/schemas/property";

const compareSchema = z.object({
  properties: z
    .array(propertySchema)
    .min(2, "Add at least 2 properties to compare")
    .max(5, "Compare at most 5 properties"),
});

type CompareFormValues = z.infer<typeof compareSchema>;

const SECOND_SAMPLE: PropertyFeatures = {
  ...SAMPLE_PROPERTY,
  square_footage: 2400,
  bedrooms: 4,
  bathrooms: 3,
  year_built: 2005,
  lot_size: 8200,
  distance_to_city_center: 2.3,
  school_rating: 8.9,
};

export function CompareClient() {
  const { state, submit } = useEstimateSubmit();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompareFormValues>({
    resolver: zodResolver(compareSchema),
    defaultValues: { properties: [SAMPLE_PROPERTY, SECOND_SAMPLE] },
    mode: "onBlur",
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties",
  });

  const arrayError = errors.properties?.root ?? errors.properties;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit((values) => submit(values.properties))}
        noValidate
        className="space-y-4"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">
                  Property {index + 1}
                </h2>
                <Button
                  variant="ghost"
                  className="px-2 py-1 text-xs"
                  disabled={fields.length <= 2}
                  onClick={() => remove(index)}
                  aria-label={`Remove property ${index + 1}`}
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {PROPERTY_FIELDS.map((f) => {
                  const error = errors.properties?.[index]?.[f.name];
                  const inputId = `properties-${index}-${f.name}`;
                  const errorId = `${inputId}-error`;
                  return (
                    <div key={f.name} className="space-y-1">
                      <Label htmlFor={inputId} className="text-xs">
                        {f.label}
                        {f.hint ? (
                          <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-400">
                            ({f.hint})
                          </span>
                        ) : null}
                      </Label>
                      <Input
                        id={inputId}
                        type="number"
                        step={f.step}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        {...register(`properties.${index}.${f.name}`, {
                          valueAsNumber: true,
                        })}
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
            </Card>
          ))}
        </div>

        {arrayError ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {arrayError.message}
          </p>
        ) : null}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            disabled={fields.length >= 5}
            onClick={() => append(SAMPLE_PROPERTY)}
          >
            Add property
          </Button>
          <Button type="submit" disabled={state.status === "submitting"}>
            {state.status === "submitting"
              ? "Comparing…"
              : `Compare ${fields.length} properties`}
          </Button>
        </div>
      </form>

      {state.status === "error" ? (
        <Alert
          variant="error"
          title={state.error.message}
          description={
            state.error.details.length > 0
              ? state.error.details
                  .map((d) => (d.field ? `${d.field}: ${d.issue}` : d.issue))
                  .join("; ")
              : undefined
          }
        />
      ) : null}

      {state.status === "success" ? (
        <CompareResults result={state.result} />
      ) : null}
    </div>
  );
}
