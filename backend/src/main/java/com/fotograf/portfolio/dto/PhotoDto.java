package com.fotograf.portfolio.dto;

public record PhotoDto(
        Long id,
        String title,
        String description,
        Long categoryId,
        String categorySlug,
        String categoryName,
        String url,
        String thumbnailUrl,
        Integer width,
        Integer height,
        String blurDataUrl,
        boolean featured,
        int displayOrder
) {
}
