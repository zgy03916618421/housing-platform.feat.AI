package com.property.app2.properties;

import com.property.app2.dataset.Property;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 明细数据端点：排序 + 筛选。 */
@RestController
@RequestMapping("/api/properties")
public class PropertiesController {

    private final PropertiesService propertiesService;

    public PropertiesController(PropertiesService propertiesService) {
        this.propertiesService = propertiesService;
    }

    @GetMapping
    public List<Property> list(
            @RequestParam(defaultValue = "price") String sort,
            @RequestParam(defaultValue = "asc") String order,
            @RequestParam(required = false) Integer bedrooms
    ) {
        if (!PropertiesService.isSortableField(sort)) {
            throw new IllegalArgumentException(
                    "Unknown sort field: " + sort + " (allowed: price, square_footage, bedrooms,"
                            + " year_built, lot_size, distance_to_city_center, school_rating)");
        }
        boolean ascending = switch (order.toLowerCase()) {
            case "asc" -> true;
            case "desc" -> false;
            default -> throw new IllegalArgumentException(
                    "Unknown order: " + order + " (allowed: asc, desc)");
        };
        return propertiesService.query(sort, ascending, bedrooms);
    }
}
