package com.fotograf.portfolio.repository;

import com.fotograf.portfolio.domain.Story;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryRepository extends JpaRepository<Story, Long> {

    List<Story> findAllByOrderByDisplayOrderAsc();
}
