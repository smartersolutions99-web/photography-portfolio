package com.fotograf.portfolio.dto;

public record LoginResponse(
        String token,
        String username,
        long expiresInSeconds
) {
}
