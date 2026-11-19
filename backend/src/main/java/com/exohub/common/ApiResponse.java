package com.exohub.common;

import java.time.Instant;

public record ApiResponse<T>(
        boolean success,
        T data,
        String errorCode,
        String message,
        Instant timestamp
) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null, null, Instant.now());
    }

    public static <T> ApiResponse<T> fail(String errorCode, String message) {
        return new ApiResponse<>(false, null, errorCode, message, Instant.now());
    }
}
