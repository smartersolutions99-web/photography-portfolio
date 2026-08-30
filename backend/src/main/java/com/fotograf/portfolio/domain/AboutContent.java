package com.fotograf.portfolio.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Singleton entitet (uvijek jedan red, id = 1) sa sadrzajem About Us stranice.
 */
@Entity
@Table(name = "about_content")
public class AboutContent {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @Column(length = 200)
    private String heading;

    @Column(columnDefinition = "text")
    private String body;

    @Column(name = "portrait_key", length = 400)
    private String portraitKey;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHeading() {
        return heading;
    }

    public void setHeading(String heading) {
        this.heading = heading;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getPortraitKey() {
        return portraitKey;
    }

    public void setPortraitKey(String portraitKey) {
        this.portraitKey = portraitKey;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
