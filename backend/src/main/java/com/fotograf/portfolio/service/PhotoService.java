package com.fotograf.portfolio.service;

import com.fotograf.portfolio.domain.Category;
import com.fotograf.portfolio.domain.Photo;
import com.fotograf.portfolio.dto.PhotoDto;
import com.fotograf.portfolio.dto.PhotoUpdateRequest;
import com.fotograf.portfolio.exception.NotFoundException;
import com.fotograf.portfolio.repository.CategoryRepository;
import com.fotograf.portfolio.repository.PhotoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final CategoryRepository categoryRepository;
    private final StorageService storage;
    private final DtoMapper mapper;

    public PhotoService(PhotoRepository photoRepository, CategoryRepository categoryRepository,
                        StorageService storage, DtoMapper mapper) {
        this.photoRepository = photoRepository;
        this.categoryRepository = categoryRepository;
        this.storage = storage;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<PhotoDto> listAll() {
        return mapper.toPhotoDtos(photoRepository.findAllByOrderByDisplayOrderAscCreatedAtDesc());
    }

    @Transactional(readOnly = true)
    public List<PhotoDto> listFeatured() {
        return mapper.toPhotoDtos(photoRepository.findByFeaturedTrueOrderByDisplayOrderAscCreatedAtDesc());
    }

    @Transactional(readOnly = true)
    public List<PhotoDto> listByCategory(Long categoryId) {
        return mapper.toPhotoDtos(photoRepository.findByCategoryIdOrderByDisplayOrderAscCreatedAtDesc(categoryId));
    }

    @Transactional(readOnly = true)
    public PhotoDto getById(Long id) {
        return mapper.toPhotoDto(findOrThrow(id));
    }

    @Transactional
    public PhotoDto upload(MultipartFile file, String title, String description,
                           Long categoryId, boolean featured) {
        StorageService.UploadResult result = storage.uploadPhoto(file, "photos");

        Photo photo = new Photo();
        photo.setTitle(emptyToNull(title));
        photo.setDescription(emptyToNull(description));
        photo.setCategory(resolveCategory(categoryId));
        photo.setObjectKey(result.objectKey());
        photo.setThumbnailKey(result.thumbnailKey());
        photo.setWidth(result.width());
        photo.setHeight(result.height());
        photo.setBlurDataUrl(result.blurDataUrl());
        photo.setFeatured(featured);
        photo.setDisplayOrder((int) photoRepository.count());

        return mapper.toPhotoDto(photoRepository.save(photo));
    }

    @Transactional
    public PhotoDto update(Long id, PhotoUpdateRequest req) {
        Photo photo = findOrThrow(id);
        photo.setTitle(emptyToNull(req.title()));
        photo.setDescription(emptyToNull(req.description()));
        photo.setCategory(resolveCategory(req.categoryId()));
        if (req.featured() != null) {
            photo.setFeatured(req.featured());
        }
        return mapper.toPhotoDto(photoRepository.save(photo));
    }

    @Transactional
    public PhotoDto setFeatured(Long id, boolean featured) {
        Photo photo = findOrThrow(id);
        photo.setFeatured(featured);
        return mapper.toPhotoDto(photoRepository.save(photo));
    }

    @Transactional
    public void delete(Long id) {
        Photo photo = findOrThrow(id);
        String objectKey = photo.getObjectKey();
        String thumbKey = photo.getThumbnailKey();
        photoRepository.delete(photo);
        photoRepository.flush();
        // R2 objekti se brisu tek nakon uspjesnog DB brisanja
        storage.delete(objectKey);
        storage.delete(thumbKey);
    }

    @Transactional
    public void reorder(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Long photoId = orderedIds.get(i);
            Photo photo = photoRepository.findById(photoId).orElse(null);
            if (photo != null) {
                photo.setDisplayOrder(i);
            }
        }
    }

    private Photo findOrThrow(Long id) {
        return photoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rad nije pronadjen: " + id));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Kategorija nije pronadjena: " + categoryId));
    }

    private String emptyToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
