package com.fotograf.portfolio.service;

import com.fotograf.portfolio.domain.Category;
import com.fotograf.portfolio.domain.Photo;
import com.fotograf.portfolio.dto.CategoryDetailDto;
import com.fotograf.portfolio.dto.CategoryDto;
import com.fotograf.portfolio.dto.CategoryRequest;
import com.fotograf.portfolio.exception.BadRequestException;
import com.fotograf.portfolio.exception.NotFoundException;
import com.fotograf.portfolio.repository.CategoryRepository;
import com.fotograf.portfolio.repository.PhotoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final PhotoRepository photoRepository;
    private final DtoMapper mapper;

    public CategoryService(CategoryRepository categoryRepository, PhotoRepository photoRepository,
                           DtoMapper mapper) {
        this.categoryRepository = categoryRepository;
        this.photoRepository = photoRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> listAll() {
        return categoryRepository.findAllByOrderByDisplayOrderAscNameAsc().stream()
                .map(c -> mapper.toCategoryDto(c, photoRepository.countByCategoryId(c.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryDetailDto getBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Kategorija nije pronadjena: " + slug));
        List<Photo> photos = photoRepository.findByCategoryIdOrderByDisplayOrderAscCreatedAtDesc(category.getId());
        return new CategoryDetailDto(
                mapper.toCategoryDto(category, photos.size()),
                mapper.toPhotoDtos(photos));
    }

    @Transactional
    public CategoryDto create(CategoryRequest req) {
        Category category = new Category();
        category.setName(req.name().trim());
        category.setDescription(emptyToNull(req.description()));
        category.setSlug(uniqueSlug(chosenSlug(req), null));
        category.setParent(resolveParent(req.parentId(), null));
        category.setDisplayOrder((int) categoryRepository.count());
        Category saved = categoryRepository.save(category);
        return mapper.toCategoryDto(saved, 0);
    }

    @Transactional
    public CategoryDto update(Long id, CategoryRequest req) {
        Category category = findOrThrow(id);
        category.setName(req.name().trim());
        category.setDescription(emptyToNull(req.description()));
        category.setSlug(uniqueSlug(chosenSlug(req), id));
        category.setParent(resolveParent(req.parentId(), id));
        Category saved = categoryRepository.save(category);
        return mapper.toCategoryDto(saved, photoRepository.countByCategoryId(id));
    }

    /** Nadkategorija: mora postojati, ne moze biti sama sebi, i mora biti glavna (bez svoje nadkategorije). */
    private Category resolveParent(Long parentId, Long selfId) {
        if (parentId == null) {
            return null;
        }
        if (selfId != null && parentId.equals(selfId)) {
            throw new BadRequestException("Kategorija ne moze biti sama sebi nadkategorija.");
        }
        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Nadkategorija nije pronadjena: " + parentId));
        if (parent.getParent() != null) {
            throw new BadRequestException("Nadkategorija mora biti glavna kategorija (dozvoljen je samo jedan nivo potkategorija).");
        }
        return parent;
    }

    @Transactional
    public void delete(Long id) {
        Category category = findOrThrow(id);
        categoryRepository.delete(category);
    }

    @Transactional
    public CategoryDto setCover(Long categoryId, Long photoId) {
        Category category = findOrThrow(categoryId);
        if (photoId == null) {
            category.setCoverPhoto(null);
        } else {
            Photo photo = photoRepository.findById(photoId)
                    .orElseThrow(() -> new NotFoundException("Rad nije pronadjen: " + photoId));
            category.setCoverPhoto(photo);
        }
        Category saved = categoryRepository.save(category);
        return mapper.toCategoryDto(saved, photoRepository.countByCategoryId(categoryId));
    }

    @Transactional
    public void reorder(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Category category = categoryRepository.findById(orderedIds.get(i)).orElse(null);
            if (category != null) {
                category.setDisplayOrder(i);
            }
        }
    }

    private Category findOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Kategorija nije pronadjena: " + id));
    }

    private String chosenSlug(CategoryRequest req) {
        String source = StringUtils.hasText(req.slug()) ? req.slug() : req.name();
        return Slugify.slugify(source);
    }

    private String uniqueSlug(String base, Long excludeId) {
        if (!StringUtils.hasText(base)) {
            throw new BadRequestException("Slug ne moze biti prazan.");
        }
        String candidate = base;
        int suffix = 2;
        while (isTaken(candidate, excludeId)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private boolean isTaken(String slug, Long excludeId) {
        return excludeId == null
                ? categoryRepository.existsBySlug(slug)
                : categoryRepository.existsBySlugAndIdNot(slug, excludeId);
    }

    private String emptyToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
