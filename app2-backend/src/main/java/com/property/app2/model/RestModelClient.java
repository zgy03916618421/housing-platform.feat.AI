package com.property.app2.model;

import com.property.app2.config.AppProperties;
import java.util.List;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

/**
 * ML 容器 HTTP 客户端（RestClient，Spring MVC 同步模型下无需 WebFlux）。
 * 约定与 App 1 一致：connect 2s / read 10s；连接错误重试 1 次；不重试 4xx/5xx。
 */
@Component
public class RestModelClient implements ModelClient {

    private final RestClient restClient;

    public RestModelClient(AppProperties properties) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2_000);
        factory.setReadTimeout(10_000);
        this.restClient = RestClient.builder()
                .baseUrl(properties.mlModelUrl())
                .requestFactory(factory)
                .build();
    }

    @Override
    public List<Double> predict(List<Map<String, Object>> features) {
        var response = executeWithRetry(() -> restClient.post()
                .uri("/predict")
                .body(features)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, List<Double>>>() {
                }));
        if (response == null || !response.containsKey("predictions")) {
            throw new ModelResponseException(200, "ML 容器响应缺少 predictions 字段");
        }
        return response.get("predictions");
    }

    @Override
    public boolean isReachable() {
        try {
            restClient.get().uri("/health").retrieve().toBodilessEntity();
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }

    /** 连接类错误重试 1 次；HTTP 错误状态不重试。 */
    private <T> T executeWithRetry(HttpCall<T> call) {
        ResourceAccessException lastError = null;
        for (int attempt = 0; attempt < 2; attempt++) {
            try {
                return call.execute();
            } catch (ResourceAccessException e) {
                // 连接失败/读超时等网络层错误
                lastError = e;
            } catch (RestClientResponseException e) {
                // ML 容器返回了非 2xx：包装为 502 语义，不重试
                throw new ModelResponseException(e.getStatusCode().value(),
                        e.getResponseBodyAsString());
            }
        }
        throw new ModelUnavailableException("ML 模型容器不可达或超时", lastError);
    }

    @FunctionalInterface
    private interface HttpCall<T> {
        T execute();
    }
}
