package com.property.app2.model;

import java.util.List;
import java.util.Map;

/** ML 容器客户端抽象：测试时可替换为 stub。 */
public interface ModelClient {

    /** 纯透传特征数组给 /predict，返回与输入等长的预测列表。 */
    List<Double> predict(List<Map<String, Object>> features);

    /** 探测 ML 容器 /health。 */
    boolean isReachable();
}
