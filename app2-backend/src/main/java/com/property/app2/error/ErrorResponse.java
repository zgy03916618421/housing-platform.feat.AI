package com.property.app2.error;

import java.util.List;

/**
 * 统一错误响应（与 App 1 格式一致，前端 apiFetch 可直接复用）：
 * { "error": { "code": "...", "message": "...", "details": [ {"field": ..., "issue": ...} ] } }
 */
public record ErrorResponse(ErrorBody error) {

    public record ErrorBody(String code, String message, List<ErrorDetail> details) {
    }

    public record ErrorDetail(String field, String issue) {
    }

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(new ErrorBody(code, message, List.of()));
    }

    public static ErrorResponse of(String code, String message, List<ErrorDetail> details) {
        return new ErrorResponse(new ErrorBody(code, message, details));
    }
}
