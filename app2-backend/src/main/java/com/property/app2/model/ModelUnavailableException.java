package com.property.app2.model;

/** ML 容器不可达或超时（映射为 503）。 */
public class ModelUnavailableException extends RuntimeException {

    public ModelUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
