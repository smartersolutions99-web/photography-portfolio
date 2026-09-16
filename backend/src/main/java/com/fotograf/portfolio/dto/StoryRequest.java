package com.fotograf.portfolio.dto;

import jakarta.validation.constraints.NotBlank;

public record StoryRequest(
        @NotBlank String title,
        @NotBlank String text,
        Long photoId,
        String accentColor
) {
}
