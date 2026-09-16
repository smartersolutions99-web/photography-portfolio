package com.fotograf.portfolio.service;

import com.fotograf.portfolio.domain.AboutContent;
import com.fotograf.portfolio.domain.Photo;
import com.fotograf.portfolio.domain.SiteSettings;
import com.fotograf.portfolio.dto.AboutDto;
import com.fotograf.portfolio.dto.AboutUpdateRequest;
import com.fotograf.portfolio.dto.ContactInfoDto;
import com.fotograf.portfolio.dto.HomeDto;
import com.fotograf.portfolio.dto.SiteSettingsDto;
import com.fotograf.portfolio.dto.SiteSettingsUpdateRequest;
import com.fotograf.portfolio.exception.NotFoundException;
import com.fotograf.portfolio.repository.AboutContentRepository;
import com.fotograf.portfolio.repository.PhotoRepository;
import com.fotograf.portfolio.repository.SiteSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** Sadrzaj stranica: About Us + globalna podesavanja sajta (kontakt, hero, itd). */
@Service
public class ContentService {

    private final AboutContentRepository aboutRepository;
    private final SiteSettingsRepository settingsRepository;
    private final PhotoRepository photoRepository;
    private final StorageService storage;
    private final DtoMapper mapper;

    public ContentService(AboutContentRepository aboutRepository, SiteSettingsRepository settingsRepository,
                          PhotoRepository photoRepository, StorageService storage, DtoMapper mapper) {
        this.aboutRepository = aboutRepository;
        this.settingsRepository = settingsRepository;
        this.photoRepository = photoRepository;
        this.storage = storage;
        this.mapper = mapper;
    }

    // -------- Landing / Home --------

    @Transactional(readOnly = true)
    public HomeDto getHome() {
        SiteSettings settings = settings();
        return mapper.toHomeDto(
                settings,
                photoRepository.findByFeaturedTrueOrderByDisplayOrderAscCreatedAtDesc());
    }

    // -------- About --------

    @Transactional(readOnly = true)
    public AboutDto getAbout() {
        return mapper.toAboutDto(about());
    }

    @Transactional
    public AboutDto updateAbout(AboutUpdateRequest req) {
        AboutContent about = about();
        about.setHeading(req.heading());
        about.setBody(req.body());
        return mapper.toAboutDto(aboutRepository.save(about));
    }

    @Transactional
    public AboutDto updatePortrait(MultipartFile file) {
        AboutContent about = about();
        String oldKey = about.getPortraitKey();
        String newKey = storage.uploadSingle(file, "about");
        about.setPortraitKey(newKey);
        AboutContent saved = aboutRepository.save(about);
        storage.delete(oldKey);
        return mapper.toAboutDto(saved);
    }

    // -------- Site settings / kontakt --------

    @Transactional(readOnly = true)
    public ContactInfoDto getContactInfo() {
        return mapper.toContactInfoDto(settings());
    }

    @Transactional(readOnly = true)
    public SiteSettingsDto getSiteSettings() {
        return mapper.toSiteSettingsDto(settings());
    }

    @Transactional
    public SiteSettingsDto updateSiteSettings(SiteSettingsUpdateRequest req) {
        SiteSettings s = settings();
        s.setSiteName(req.siteName());
        s.setTagline(req.tagline());
        s.setEmail(req.email());
        s.setPhone(req.phone());
        s.setAddress(req.address());
        s.setLocation(req.location());
        s.setInstagramUrl(req.instagramUrl());
        s.setFacebookUrl(req.facebookUrl());
        s.setHeroTitle(req.heroTitle());
        s.setHeroSubtitle(req.heroSubtitle());
        s.setHeroPhoto(resolvePhoto(req.heroPhotoId()));
        s.setBeforeAfterPhoto(resolvePhoto(req.beforeAfterPhotoId()));
        s.setPressQuote(req.pressQuote());
        s.setPressSource(req.pressSource());
        s.setEditorialStatement(req.editorialStatement());
        s.setSeoTitle(req.seoTitle());
        s.setSeoDescription(req.seoDescription());
        return mapper.toSiteSettingsDto(settingsRepository.save(s));
    }

    // -------- helpers --------

    private Photo resolvePhoto(Long photoId) {
        if (photoId == null || photoId <= 0) {
            return null;
        }
        return photoRepository.findById(photoId)
                .orElseThrow(() -> new NotFoundException("Rad nije pronadjen: " + photoId));
    }

    private AboutContent about() {
        return aboutRepository.findById(AboutContent.SINGLETON_ID)
                .orElseGet(() -> {
                    AboutContent a = new AboutContent();
                    a.setId(AboutContent.SINGLETON_ID);
                    return a;
                });
    }

    private SiteSettings settings() {
        return settingsRepository.findById(SiteSettings.SINGLETON_ID)
                .orElseGet(() -> {
                    SiteSettings s = new SiteSettings();
                    s.setId(SiteSettings.SINGLETON_ID);
                    return s;
                });
    }
}
