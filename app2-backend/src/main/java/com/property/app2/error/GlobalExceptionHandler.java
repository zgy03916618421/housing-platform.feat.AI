package com.property.app2.error;

import com.property.app2.model.ModelResponseException;
import com.property.app2.model.ModelUnavailableException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 全局异常处理：统一包装为 { error: { code, message, details } }。
 * 状态码语义：400 参数/校验错误；502 ML 返回错误；503 ML 不可达；404 资源不存在；500 其他。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 请求体校验失败（@Valid）。 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleBodyValidation(MethodArgumentNotValidException ex) {
        List<ErrorResponse.ErrorDetail> details = ex.getBindingResult().getFieldErrors().stream()
                .map(GlobalExceptionHandler::toDetail)
                .toList();
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "请求参数校验失败", details);
    }

    /** 容器级校验失败（如 @Size 作用于请求体 List）。 */
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleMethodValidation(HandlerMethodValidationException ex) {
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", ex.getMessage());
    }

    /** 请求体 JSON 解析失败。 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleNotReadable(HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "请求体不是合法的 JSON");
    }

    /** 业务层参数错误（非法分段维度/排序字段、year_built 超当前年等）。 */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", ex.getMessage());
    }

    @ExceptionHandler(ModelUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleModelUnavailable(ModelUnavailableException ex) {
        return build(HttpStatus.SERVICE_UNAVAILABLE, "MODEL_UNAVAILABLE", ex.getMessage());
    }

    @ExceptionHandler(ModelResponseException.class)
    public ResponseEntity<ErrorResponse> handleModelResponse(ModelResponseException ex) {
        return build(HttpStatus.BAD_GATEWAY, "MODEL_ERROR",
                "ML 容器返回错误（HTTP " + ex.statusCode() + "）",
                List.of(new ErrorResponse.ErrorDetail(null, ex.getMessage())));
    }

    /** 未匹配的静态资源/路径（Spring 6.1+）。 */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoResourceFoundException ex) {
        return build(HttpStatus.NOT_FOUND, "NOT_FOUND", "资源不存在");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("未预期错误", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "服务器内部错误");
    }

    private static ErrorResponse.ErrorDetail toDetail(FieldError error) {
        return new ErrorResponse.ErrorDetail(error.getField(), error.getDefaultMessage());
    }

    private static ResponseEntity<ErrorResponse> build(HttpStatus status, String code, String message) {
        return build(status, code, message, List.of());
    }

    private static ResponseEntity<ErrorResponse> build(
            HttpStatus status, String code, String message, List<ErrorResponse.ErrorDetail> details) {
        return ResponseEntity.status(status).body(ErrorResponse.of(code, message, details));
    }
}
