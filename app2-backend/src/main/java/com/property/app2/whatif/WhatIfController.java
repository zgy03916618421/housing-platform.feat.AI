package com.property.app2.whatif;

import com.property.app2.model.ModelClient;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.time.Year;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * what-if 分析端点：数组契约（与 ML 容器 /predict 同构），
 * 单条=1 元素数组，对比=N 元素数组。
 */
@RestController
@RequestMapping("/api/whatif")
public class WhatIfController {

    private final ModelClient modelClient;

    public WhatIfController(ModelClient modelClient) {
        this.modelClient = modelClient;
    }

    public record WhatIfResponse(List<Double> predictions) {
    }

    @PostMapping
    public WhatIfResponse predict(
            @RequestBody @Size(min = 1, message = "At least one property is required")
            List<@Valid PropertyFeaturesInput> items
    ) {
        // 动态约束：year_built 不能超过当前年份（注解无法表达动态上限）
        int currentYear = Year.now().getValue();
        for (PropertyFeaturesInput item : items) {
            if (item.yearBuilt() > currentYear) {
                throw new IllegalArgumentException(
                        "year_built cannot be later than " + currentYear);
            }
        }
        List<Map<String, Object>> payload = items.stream()
                .map(PropertyFeaturesInput::toModelPayload)
                .toList();
        return new WhatIfResponse(modelClient.predict(payload));
    }
}
