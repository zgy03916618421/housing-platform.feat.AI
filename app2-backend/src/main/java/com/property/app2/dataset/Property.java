package com.property.app2.dataset;

import com.fasterxml.jackson.annotation.JsonProperty;

/** 数据集中的一条房产记录（对应 CSV 一行，序列化字段名保持 snake_case 与数据集一致）。 */
public record Property(
        long id,
        @JsonProperty("square_footage") int squareFootage,
        int bedrooms,
        double bathrooms,
        @JsonProperty("year_built") int yearBuilt,
        @JsonProperty("lot_size") long lotSize,
        @JsonProperty("distance_to_city_center") double distanceToCityCenter,
        @JsonProperty("school_rating") double schoolRating,
        long price
) {
}
