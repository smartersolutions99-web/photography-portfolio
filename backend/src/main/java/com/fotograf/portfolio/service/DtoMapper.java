package com.fotograf.portfolio.service;

import com.fotograf.portfolio.domain.AboutContent;
import com.fotograf.portfolio.domain.Category;
import com.fotograf.portfolio.domain.ContactMessage;
import com.fotograf.portfolio.domain.Photo;
import com.fotograf.portfolio.domain.SiteSettings;
import com.fotograf.portfolio.domain.Story;
import com.fotograf.portfolio.dto.AboutDto;
import com.fotograf.portfolio.dto.CategoryDto;
import com.fotograf.portfolio.dto.ContactInfoDto;
import com.fotograf.portfolio.dto.ContactMessageDto;
import com.fotograf.portfolio.dto.HomeDto;
import com.fotograf.portfolio.dto.PhotoDto;
import com.fotograf.portfolio.dto.SiteSettingsDto;
import com.fotograf.portfolio.dto.StoryDto;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    private final StorageService storage;

    public DtoMapper(StorageService storage) {
        this.storage = storage;
    }

    public PhotoDto toPhotoDto(Photo p) {
        Category c = p.getCategory();
        String thumbKey = p.getThumbnailKey() != null ? p.getThumbnailKey() : p.getObjectKey();
        return new PhotoDto(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                c != null ? c.getId() : null,
                c != null ? c.getSlug() : null,
                c != null ? c.getName() : null,
                storage.publicUrl(p.getObjectKey()),
                storage.publicUrl(thumbKey),
                p.getWidth(),
                p.getHeight(),
                p.getBlurDataUrl(),
                p.isFeatured(),
                p.getDisplayOrder());
    }

    public List<PhotoDto> toPhotoDtos(List<Photo> photos) {
        return photos.stream().map(this::toPhotoDto).toList();
    }

    public CategoryDto toCategoryDto(Category c, long photoCount) {
        Photo cover = c.getCoverPhoto();
        String coverUrl = cover != null ? storage.publicUrl(cover.getObjectKey()) : null;
        Category parent = c.getParent();
        return new CategoryDto(
                c.getId(),
                c.getName(),
                c.getSlug(),
                c.getDescription(),
                coverUrl,
                cover != null ? cover.getId() : null,
                c.getDisplayOrder(),
                photoCount,
                parent != null ? parent.getId() : null,
                parent != null ? parent.getSlug() : null,
                parent != null ? parent.getName() : null);
    }

    public AboutDto toAboutDto(AboutContent a) {
        return new AboutDto(
                a.getHeading(),
                a.getBody(),
                storage.publicUrl(a.getPortraitKey()));
    }

    public ContactInfoDto toContactInfoDto(SiteSettings s) {
        return new ContactInfoDto(
                s.getSiteName(),
                s.getTagline(),
                s.getEmail(),
                s.getPhone(),
                s.getAddress(),
                s.getLocation(),
                s.getInstagramUrl(),
                s.getFacebookUrl());
    }

    public SiteSettingsDto toSiteSettingsDto(SiteSettings s) {
        Photo hero = s.getHeroPhoto();
        Photo beforeAfter = s.getBeforeAfterPhoto();
        return new SiteSettingsDto(
                s.getSiteName(),
                s.getTagline(),
                s.getEmail(),
                s.getPhone(),
                s.getAddress(),
                s.getLocation(),
                s.getInstagramUrl(),
                s.getFacebookUrl(),
                s.getHeroTitle(),
                s.getHeroSubtitle(),
                hero != null ? hero.getId() : null,
                hero != null ? storage.publicUrl(hero.getObjectKey()) : null,
                beforeAfter != null ? beforeAfter.getId() : null,
                beforeAfter != null ? storage.publicUrl(beforeAfter.getObjectKey()) : null,
                s.getPressQuote(),
                s.getPressSource(),
                s.getEditorialStatement(),
                s.getSeoTitle(),
                s.getSeoDescription());
    }

    public HomeDto toHomeDto(SiteSettings s, List<Photo> featured) {
        Photo hero = s.getHeroPhoto();
        Photo beforeAfter = s.getBeforeAfterPhoto();
        return new HomeDto(
                s.getSiteName(),
                s.getTagline(),
                s.getHeroTitle(),
                s.getHeroSubtitle(),
                hero != null ? storage.publicUrl(hero.getObjectKey()) : null,
                beforeAfter != null ? storage.publicUrl(beforeAfter.getObjectKey()) : null,
                s.getPressQuote(),
                s.getPressSource(),
                s.getEditorialStatement(),
                toPhotoDtos(featured));
    }

    public StoryDto toStoryDto(Story s) {
        Photo p = s.getPhoto();
        return new StoryDto(
                s.getId(),
                s.getTitle(),
                s.getBody(),
                p != null ? storage.publicUrl(p.getObjectKey()) : null,
                p != null ? p.getId() : null,
                s.getAccentColor(),
                s.getDisplayOrder());
    }

    public ContactMessageDto toContactMessageDto(ContactMessage m) {
        return new ContactMessageDto(
                m.getId(),
                m.getName(),
                m.getEmail(),
                m.getMessage(),
                m.isRead(),
                m.getCreatedAt());
    }
}
