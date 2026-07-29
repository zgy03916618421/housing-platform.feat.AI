package com.property.app2.stats;

import com.property.app2.dataset.Property;
import java.util.function.Function;

/** 支持的分段维度（对应 /api/stats/segments 的 by 参数）。 */
public enum SegmentDimension {
    /** 按卧室数分段："3 bed" */
    BEDROOMS(p -> p.bedrooms() + " bed"),
    /** 按建造年代分段："1990s" */
    DECADE(p -> (p.yearBuilt() / 10 * 10) + "s"),
    /** 按学校评分档分段 */
    SCHOOL_BAND(p -> {
        double r = p.schoolRating();
        if (r < 5) return "0–5";
        if (r < 7) return "5–7";
        if (r < 9) return "7–9";
        return "9–10";
    }),
    /** 按距市中心距离档分段（英里） */
    DISTANCE_BAND(p -> {
        double d = p.distanceToCityCenter();
        if (d < 2) return "0–2 mi";
        if (d < 5) return "2–5 mi";
        if (d < 8) return "5–8 mi";
        return "8+ mi";
    });

    private final Function<Property, String> classifier;

    SegmentDimension(Function<Property, String> classifier) {
        this.classifier = classifier;
    }

    public String segmentOf(Property property) {
        return classifier.apply(property);
    }

    /** URL 参数（snake_case）到枚举的映射，非法值抛 IllegalArgumentException。 */
    public static SegmentDimension fromParam(String value) {
        return switch (value.toLowerCase()) {
            case "bedrooms" -> BEDROOMS;
            case "decade" -> DECADE;
            case "school_band" -> SCHOOL_BAND;
            case "distance_band" -> DISTANCE_BAND;
            default -> throw new IllegalArgumentException(
                    "Unknown segment dimension: " + value
                            + " (allowed: bedrooms, decade, school_band, distance_band)");
        };
    }
}
