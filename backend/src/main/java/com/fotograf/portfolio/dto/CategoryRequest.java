package com.fotograf.portfolio.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
        @NotBlank String name,
        String slug,
        String description,
        Long parentId
) {
}
