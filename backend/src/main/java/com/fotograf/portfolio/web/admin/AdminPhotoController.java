package com.fotograf.portfolio.web.admin;

import com.fotograf.portfolio.dto.FeaturedRequest;
import com.fotograf.portfolio.dto.PhotoDto;
import com.fotograf.portfolio.dto.PhotoUpdateRequest;
import com.fotograf.portfolio.dto.ReorderRequest;
import com.fotograf.portfolio.service.PhotoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/photos")
public class AdminPhotoController {

    private final PhotoService photoService;

    public AdminPhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @GetMapping
    public List<PhotoDto> list() {
        return photoService.listAll();
    }

    @GetMapping("/{id}")
    public PhotoDto get(@PathVariable Long id) {
        return photoService.getById(id);
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public PhotoDto upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "false") boolean featured) {
        return photoService.upload(file, title, description, categoryId, featured);
    }

    @PutMapping("/{id}")
    public PhotoDto update(@PathVariable Long id, @RequestBody PhotoUpdateRequest req) {
        return photoService.update(id, req);
    }

    @PatchMapping("/{id}/featured")
    public PhotoDto setFeatured(@PathVariable Long id, @RequestBody FeaturedRequest req) {
        return photoService.setFeatured(id, req.featured());
    }

    @PutMapping("/order")
    public void reorder(@Valid @RequestBody ReorderRequest req) {
        photoService.reorder(req.orderedIds());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        photoService.delete(id);
    }
}
