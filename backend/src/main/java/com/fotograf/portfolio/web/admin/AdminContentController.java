package com.fotograf.portfolio.web.admin;

import com.fotograf.portfolio.dto.AboutDto;
import com.fotograf.portfolio.dto.AboutUpdateRequest;
import com.fotograf.portfolio.dto.SiteSettingsDto;
import com.fotograf.portfolio.dto.SiteSettingsUpdateRequest;
import com.fotograf.portfolio.service.ContentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
public class AdminContentController {

    private final ContentService contentService;

    public AdminContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    // -------- About --------

    @GetMapping("/about")
    public AboutDto getAbout() {
        return contentService.getAbout();
    }

    @PutMapping("/about")
    public AboutDto updateAbout(@RequestBody AboutUpdateRequest req) {
        return contentService.updateAbout(req);
    }

    @PostMapping(value = "/about/portrait", consumes = "multipart/form-data")
    public AboutDto updatePortrait(@RequestParam("file") MultipartFile file) {
        return contentService.updatePortrait(file);
    }

    // -------- Site settings --------

    @GetMapping("/site-settings")
    public SiteSettingsDto getSiteSettings() {
        return contentService.getSiteSettings();
    }

    @PutMapping("/site-settings")
    public SiteSettingsDto updateSiteSettings(@RequestBody SiteSettingsUpdateRequest req) {
        return contentService.updateSiteSettings(req);
    }
}
