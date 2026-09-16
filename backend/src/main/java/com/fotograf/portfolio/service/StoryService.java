package com.fotograf.portfolio.service;

import com.fotograf.portfolio.domain.Photo;
import com.fotograf.portfolio.domain.Story;
import com.fotograf.portfolio.dto.StoryDto;
import com.fotograf.portfolio.dto.StoryRequest;
import com.fotograf.portfolio.exception.NotFoundException;
import com.fotograf.portfolio.repository.PhotoRepository;
import com.fotograf.portfolio.repository.StoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class StoryService {

    private static final String DEFAULT_ACCENT = "#9A7B4F";

    private final StoryRepository storyRepository;
    private final PhotoRepository photoRepository;
    private final DtoMapper mapper;

    public StoryService(StoryRepository storyRepository, PhotoRepository photoRepository, DtoMapper mapper) {
        this.storyRepository = storyRepository;
        this.photoRepository = photoRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<StoryDto> listAll() {
        return storyRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(mapper::toStoryDto)
                .toList();
    }

    @Transactional
    public StoryDto create(StoryRequest req) {
        Story story = new Story();
        story.setTitle(req.title().trim());
        story.setBody(req.text().trim());
        story.setAccentColor(chosenAccent(req));
        story.setPhoto(resolvePhoto(req.photoId()));
        story.setDisplayOrder((int) storyRepository.count());
        return mapper.toStoryDto(storyRepository.save(story));
    }

    @Transactional
    public StoryDto update(Long id, StoryRequest req) {
        Story story = findOrThrow(id);
        story.setTitle(req.title().trim());
        story.setBody(req.text().trim());
        story.setAccentColor(chosenAccent(req));
        story.setPhoto(resolvePhoto(req.photoId()));
        return mapper.toStoryDto(storyRepository.save(story));
    }

    @Transactional
    public void delete(Long id) {
        storyRepository.delete(findOrThrow(id));
    }

    @Transactional
    public void reorder(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Story story = storyRepository.findById(orderedIds.get(i)).orElse(null);
            if (story != null) {
                story.setDisplayOrder(i);
            }
        }
    }

    private Story findOrThrow(Long id) {
        return storyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Priča nije pronađena: " + id));
    }

    private Photo resolvePhoto(Long photoId) {
        if (photoId == null) {
            return null;
        }
        return photoRepository.findById(photoId)
                .orElseThrow(() -> new NotFoundException("Rad nije pronađen: " + photoId));
    }

    private String chosenAccent(StoryRequest req) {
        return StringUtils.hasText(req.accentColor()) ? req.accentColor().trim() : DEFAULT_ACCENT;
    }
}
