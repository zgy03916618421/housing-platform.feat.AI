package com.property.app2.model;

/** ML 容器返回非 2xx（映射为 502）。 */
public class ModelResponseException extends RuntimeException {

    private final int statusCode;

    public ModelResponseException(int statusCode, String body) {
        super(body);
        this.statusCode = statusCode;
    }

    public int statusCode() {
        return statusCode;
    }
}
