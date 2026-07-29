package com.property.app2.whatif;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * what-if 请求中的单个属性特征（校验约束镜像 Task 1，JSON 字段名 snake_case）。
 */
public record PropertyFeaturesInput(
        @JsonProperty("square_footage") @Positive int squareFootage,
        @Min(1) @Max(20) int bedrooms,
        @DecimalMin("0.5") @DecimalMax("20.0") double bathrooms,
        @JsonProperty("year_built") @Min(1800) int yearBuilt,
        @JsonProperty("lot_size") @Positive long lotSize,
        @JsonProperty("distance_to_city_center") @PositiveOrZero double distanceToCityCenter,
        @JsonProperty("school_rating") @DecimalMin("0.0") @DecimalMax("10.0") double schoolRating
) {
    /** 转为 ML 容器契约的键值对（字段顺序与 Task 1 schema 一致）。 */
    public Map<String, Object> toModelPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("square_footage", squareFootage);
        payload.put("bedrooms", bedrooms);
        payload.put("bathrooms", bathrooms);
        payload.put("year_built", yearBuilt);
        payload.put("lot_size", lotSize);
        payload.put("distance_to_city_center", distanceToCityCenter);
        payload.put("school_rating", schoolRating);
        return payload;
    }
}
