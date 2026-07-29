package com.property.app2.properties;

import com.property.app2.dataset.DatasetLoader;
import com.property.app2.dataset.Property;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/** 明细数据查询：排序 + 等值筛选（50 行规模，全量返回不分页）。 */
@Service
public class PropertiesService {

    /** 可排序字段白名单 → 比较器 */
    private static final Map<String, Comparator<Property>> SORTABLE_FIELDS = Map.of(
            "price", Comparator.comparingLong(Property::price),
            "square_footage", Comparator.comparingInt(Property::squareFootage),
            "bedrooms", Comparator.comparingInt(Property::bedrooms),
            "year_built", Comparator.comparingInt(Property::yearBuilt),
            "lot_size", Comparator.comparingLong(Property::lotSize),
            "distance_to_city_center", Comparator.comparingDouble(Property::distanceToCityCenter),
            "school_rating", Comparator.comparingDouble(Property::schoolRating)
    );

    private final DatasetLoader dataset;

    public PropertiesService(DatasetLoader dataset) {
        this.dataset = dataset;
    }

    public static boolean isSortableField(String field) {
        return SORTABLE_FIELDS.containsKey(field);
    }

    @Cacheable("properties")
    public List<Property> query(String sort, boolean ascending, Integer bedrooms) {
        Comparator<Property> comparator = SORTABLE_FIELDS.get(sort);
        if (!ascending) {
            comparator = comparator.reversed();
        }
        return dataset.all().stream()
                .filter(p -> bedrooms == null || p.bedrooms() == bedrooms)
                .sorted(comparator)
                .toList();
    }
}
