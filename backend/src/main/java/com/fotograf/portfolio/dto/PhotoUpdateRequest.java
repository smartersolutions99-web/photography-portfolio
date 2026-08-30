package com.fotograf.portfolio.dto;

public record PhotoUpdateRequest(
        String title,
        String description,
        Long categoryId,
        Boolean featured
) {
}
