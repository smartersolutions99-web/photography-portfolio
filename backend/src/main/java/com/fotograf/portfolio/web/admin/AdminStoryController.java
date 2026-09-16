package com.fotograf.portfolio.web.admin;

import com.fotograf.portfolio.dto.ReorderRequest;
import com.fotograf.portfolio.dto.StoryDto;
import com.fotograf.portfolio.dto.StoryRequest;
import com.fotograf.portfolio.service.StoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stories")
public class AdminStoryController {

    private final StoryService storyService;

    public AdminStoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @GetMapping
    public List<StoryDto> list() {
        return storyService.listAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StoryDto create(@Valid @RequestBody StoryRequest req) {
        return storyService.create(req);
    }

    @PutMapping("/{id}")
    public StoryDto update(@PathVariable Long id, @Valid @RequestBody StoryRequest req) {
        return storyService.update(id, req);
    }

    @PutMapping("/order")
    public void reorder(@Valid @RequestBody ReorderRequest req) {
        storyService.reorder(req.orderedIds());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        storyService.delete(id);
    }
}
