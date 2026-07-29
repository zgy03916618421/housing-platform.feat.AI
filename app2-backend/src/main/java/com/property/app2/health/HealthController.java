package com.property.app2.health;

import com.property.app2.model.ModelClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 健康检查：自身存活 + ML 容器可达性（与 App 1 的 /api/health 语义一致）。 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final ModelClient modelClient;

    public HealthController(ModelClient modelClient) {
        this.modelClient = modelClient;
    }

    public record HealthResponse(String status, boolean ml_model_reachable) {
    }

    @GetMapping
    public HealthResponse health() {
        return new HealthResponse("ok", modelClient.isReachable());
    }
}
