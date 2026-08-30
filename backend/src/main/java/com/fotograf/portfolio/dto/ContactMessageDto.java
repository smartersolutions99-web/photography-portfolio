package com.fotograf.portfolio.dto;

import java.time.Instant;

public record ContactMessageDto(
        Long id,
        String name,
        String email,
        String message,
        boolean read,
        Instant createdAt
) {
}
