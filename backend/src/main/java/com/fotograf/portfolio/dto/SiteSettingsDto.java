package com.fotograf.portfolio.dto;

public record SiteSettingsDto(
        String siteName,
        String tagline,
        String email,
        String phone,
        String address,
        String location,
        String instagramUrl,
        String facebookUrl,
        String heroTitle,
        String heroSubtitle,
        Long heroPhotoId,
        String heroUrl,
        String pressQuote,
        String pressSource,
        String editorialStatement,
        String seoTitle,
        String seoDescription
) {
}
