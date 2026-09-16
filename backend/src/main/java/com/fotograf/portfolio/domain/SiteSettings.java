package com.fotograf.portfolio.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Singleton entitet (uvijek jedan red, id = 1) sa globalnim podesavanjima sajta:
 * kontakt info, hero landinga, editorial kopija i SEO.
 */
@Entity
@Table(name = "site_settings")
public class SiteSettings {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @Column(name = "site_name", length = 150)
    private String siteName;

    @Column(length = 300)
    private String tagline;

    @Column(length = 200)
    private String email;

    @Column(length = 80)
    private String phone;

    @Column(length = 300)
    private String address;

    @Column(length = 200)
    private String location;

    @Column(name = "instagram_url", length = 300)
    private String instagramUrl;

    @Column(name = "facebook_url", length = 300)
    private String facebookUrl;

    @Column(name = "hero_title", length = 300)
    private String heroTitle;

    @Column(name = "hero_subtitle", length = 400)
    private String heroSubtitle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hero_photo_id")
    private Photo heroPhoto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "before_after_photo_id")
    private Photo beforeAfterPhoto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_photo_id")
    private Photo quotePhoto;

    @Column(name = "press_quote", columnDefinition = "text")
    private String pressQuote;

    @Column(name = "press_source", length = 200)
    private String pressSource;

    @Column(name = "editorial_statement", columnDefinition = "text")
    private String editorialStatement;

    @Column(name = "seo_title", length = 200)
    private String seoTitle;

    @Column(name = "seo_description", length = 400)
    private String seoDescription;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSiteName() {
        return siteName;
    }

    public void setSiteName(String siteName) {
        this.siteName = siteName;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getInstagramUrl() {
        return instagramUrl;
    }

    public void setInstagramUrl(String instagramUrl) {
        this.instagramUrl = instagramUrl;
    }

    public String getFacebookUrl() {
        return facebookUrl;
    }

    public void setFacebookUrl(String facebookUrl) {
        this.facebookUrl = facebookUrl;
    }

    public String getHeroTitle() {
        return heroTitle;
    }

    public void setHeroTitle(String heroTitle) {
        this.heroTitle = heroTitle;
    }

    public String getHeroSubtitle() {
        return heroSubtitle;
    }

    public void setHeroSubtitle(String heroSubtitle) {
        this.heroSubtitle = heroSubtitle;
    }

    public Photo getHeroPhoto() {
        return heroPhoto;
    }

    public void setHeroPhoto(Photo heroPhoto) {
        this.heroPhoto = heroPhoto;
    }

    public Photo getBeforeAfterPhoto() {
        return beforeAfterPhoto;
    }

    public void setBeforeAfterPhoto(Photo beforeAfterPhoto) {
        this.beforeAfterPhoto = beforeAfterPhoto;
    }

    public Photo getQuotePhoto() {
        return quotePhoto;
    }

    public void setQuotePhoto(Photo quotePhoto) {
        this.quotePhoto = quotePhoto;
    }

    public String getPressQuote() {
        return pressQuote;
    }

    public void setPressQuote(String pressQuote) {
        this.pressQuote = pressQuote;
    }

    public String getPressSource() {
        return pressSource;
    }

    public void setPressSource(String pressSource) {
        this.pressSource = pressSource;
    }

    public String getEditorialStatement() {
        return editorialStatement;
    }

    public void setEditorialStatement(String editorialStatement) {
        this.editorialStatement = editorialStatement;
    }

    public String getSeoTitle() {
        return seoTitle;
    }

    public void setSeoTitle(String seoTitle) {
        this.seoTitle = seoTitle;
    }

    public String getSeoDescription() {
        return seoDescription;
    }

    public void setSeoDescription(String seoDescription) {
        this.seoDescription = seoDescription;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
