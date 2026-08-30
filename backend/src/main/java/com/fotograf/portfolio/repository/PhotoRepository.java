package com.fotograf.portfolio.repository;

import com.fotograf.portfolio.domain.Photo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findAllByOrderByDisplayOrderAscCreatedAtDesc();

    List<Photo> findByFeaturedTrueOrderByDisplayOrderAscCreatedAtDesc();

    List<Photo> findByCategoryIdOrderByDisplayOrderAscCreatedAtDesc(Long categoryId);

    long countByCategoryId(Long categoryId);
}
