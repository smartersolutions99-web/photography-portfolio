package com.fotograf.portfolio.dto;

import java.util.List;

public record CategoryDetailDto(
        CategoryDto category,
        List<PhotoDto> photos
) {
}
