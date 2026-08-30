package com.fotograf.portfolio.dto;

public record CategoryDto(
        Long id,
        String name,
        String slug,
        String description,
        String coverUrl,
        Long coverPhotoId,
        int displayOrder,
        long photoCount,
        Long parentId,
        String parentSlug,
        String parentName
) {
}
