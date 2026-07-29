package com.property.app2.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 应用配置（application.yml 的 app.* 前缀）。
 * mlModelUrl：Task 1 ML 容器地址；corsOrigins：允许的前端源。
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(String mlModelUrl, List<String> corsOrigins) {
}
