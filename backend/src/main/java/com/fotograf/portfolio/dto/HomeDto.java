package com.fotograf.portfolio.dto;

import java.util.List;

public record HomeDto(
        String siteName,
        String tagline,
        String heroTitle,
        String heroSubtitle,
        String heroUrl,
        String beforeAfterUrl,
        String pressQuote,
        String pressSource,
        String editorialStatement,
        List<PhotoDto> featured
) {
}
