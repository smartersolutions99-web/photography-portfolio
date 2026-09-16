package com.fotograf.portfolio.web;

import com.fotograf.portfolio.dto.AboutDto;
import com.fotograf.portfolio.dto.CategoryDetailDto;
import com.fotograf.portfolio.dto.CategoryDto;
import com.fotograf.portfolio.dto.ContactInfoDto;
import com.fotograf.portfolio.dto.ContactMessageRequest;
import com.fotograf.portfolio.dto.HomeDto;
import com.fotograf.portfolio.dto.PhotoDto;
import com.fotograf.portfolio.dto.StoryDto;
import com.fotograf.portfolio.service.CategoryService;
import com.fotograf.portfolio.service.ContactService;
import com.fotograf.portfolio.service.ContentService;
import com.fotograf.portfolio.service.PhotoService;
import com.fotograf.portfolio.service.StoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Javni API koji koristi prezentacioni sajt (bez autentikacije). */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final PhotoService photoService;
    private final CategoryService categoryService;
    private final ContentService contentService;
    private final ContactService contactService;
    private final StoryService storyService;

    public PublicController(PhotoService photoService, CategoryService categoryService,
                            ContentService contentService, ContactService contactService,
                            StoryService storyService) {
        this.photoService = photoService;
        this.categoryService = categoryService;
        this.contentService = contentService;
        this.contactService = contactService;
        this.storyService = storyService;
    }

    @GetMapping("/home")
    public HomeDto home() {
        return contentService.getHome();
    }

    @GetMapping("/photos")
    public List<PhotoDto> photos(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean featured) {
        if (Boolean.TRUE.equals(featured)) {
            return photoService.listFeatured();
        }
        if (categoryId != null) {
            return photoService.listByCategory(categoryId);
        }
        return photoService.listAll();
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories() {
        return categoryService.listAll();
    }

    @GetMapping("/categories/{slug}")
    public CategoryDetailDto category(@PathVariable String slug) {
        return categoryService.getBySlug(slug);
    }

    @GetMapping("/stories")
    public List<StoryDto> stories() {
        return storyService.listAll();
    }

    @GetMapping("/about")
    public AboutDto about() {
        return contentService.getAbout();
    }

    @GetMapping("/contact")
    public ContactInfoDto contact() {
        return contentService.getContactInfo();
    }

    @PostMapping("/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public void submitContact(@Valid @RequestBody ContactMessageRequest req) {
        contactService.submit(req);
    }
}
