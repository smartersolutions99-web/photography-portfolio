package com.fotograf.portfolio.dto;

public record StoryDto(
        Long id,
        String title,
        String text,
        String imageUrl,
        Long photoId,
        String accentColor,
        int displayOrder
) {
}
