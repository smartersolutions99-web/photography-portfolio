package com.fotograf.portfolio.service;

import com.fotograf.portfolio.exception.BadRequestException;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;
import javax.imageio.ImageIO;
import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

/**
 * Upload i brisanje slika na Cloudflare R2 (S3 API), uz generisanje thumbnail-a
 * i citanje dimenzija originala.
 */
@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);
    private static final int THUMB_MAX = 900;
    // LQIP: sićušna slika (max ~24px) koja se base64-uje i šalje frontendu kao blur placeholder
    private static final int BLUR_MAX = 24;

    private final S3Client s3Client;
    private final String bucket;
    private final String publicBaseUrl;

    public StorageService(
            S3Client s3Client,
            @Value("${app.r2.bucket}") String bucket,
            @Value("${app.r2.public-base-url}") String publicBaseUrl) {
        this.s3Client = s3Client;
        this.bucket = bucket;
        this.publicBaseUrl = publicBaseUrl;
    }

    /** Rezultat uploada fotografije. */
    public record UploadResult(String objectKey, String thumbnailKey, Integer width, Integer height,
                               String blurDataUrl) {
    }

    /**
     * Uploaduje original + generisan thumbnail. Ako se slika ne moze dekodirati
     * (npr. nepodrzan format), uploaduje se samo original bez thumbnaila.
     */
    public UploadResult uploadPhoto(MultipartFile file, String folder) {
        byte[] bytes = readBytes(file);
        String ext = resolveExtension(file);
        String contentType = resolveContentType(file, ext);

        String base = folder + "/" + UUID.randomUUID();
        String objectKey = base + "." + ext;
        put(objectKey, bytes, contentType);

        Integer width = null;
        Integer height = null;
        String thumbnailKey = null;
        String blurDataUrl = null;
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
            if (image != null) {
                width = image.getWidth();
                height = image.getHeight();
                // Uvijek JPEG thumbnail (znatno manji fajl); providne slike spljosti na bijelu pozadinu
                BufferedImage source = image;
                if (image.getColorModel().hasAlpha()) {
                    source = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB);
                    Graphics2D g = source.createGraphics();
                    g.setColor(Color.WHITE);
                    g.fillRect(0, 0, image.getWidth(), image.getHeight());
                    g.drawImage(image, 0, 0, null);
                    g.dispose();
                }
                ByteArrayOutputStream thumbOut = new ByteArrayOutputStream();
                Thumbnails.of(source)
                        .size(THUMB_MAX, THUMB_MAX)
                        .keepAspectRatio(true)
                        .outputQuality(0.82)
                        .outputFormat("jpg")
                        .toOutputStream(thumbOut);
                thumbnailKey = base + "_thumb.jpg";
                put(thumbnailKey, thumbOut.toByteArray(), "image/jpeg");

                blurDataUrl = buildBlurDataUrl(source);
            }
        } catch (IOException | RuntimeException e) {
            log.warn("Neuspjelo generisanje thumbnaila za {}: {}", objectKey, e.getMessage());
        }

        return new UploadResult(objectKey, thumbnailKey, width, height, blurDataUrl);
    }

    /**
     * Generiše LQIP: sićušan (max ~24px) JPEG originala, base64-ovan kao data URI.
     * Frontend ga prikazuje zamućenog dok se prava slika ne učita. Vraća null ako
     * generisanje ne uspije (upload se tad nastavlja bez blur-a).
     */
    private String buildBlurDataUrl(BufferedImage source) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Thumbnails.of(source)
                    .size(BLUR_MAX, BLUR_MAX)
                    .keepAspectRatio(true)
                    .outputQuality(0.5)
                    .outputFormat("jpg")
                    .toOutputStream(out);
            String base64 = Base64.getEncoder().encodeToString(out.toByteArray());
            return "data:image/jpeg;base64," + base64;
        } catch (IOException | RuntimeException e) {
            log.warn("Neuspjelo generisanje blur placeholdera: {}", e.getMessage());
            return null;
        }
    }

    /** Jednostavan upload (npr. portret), samo original, vraca object key. */
    public String uploadSingle(MultipartFile file, String folder) {
        byte[] bytes = readBytes(file);
        String ext = resolveExtension(file);
        String key = folder + "/" + UUID.randomUUID() + "." + ext;
        put(key, bytes, resolveContentType(file, ext));
        return key;
    }

    public void delete(String key) {
        if (!StringUtils.hasText(key)) {
            return;
        }
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket).key(key).build());
        } catch (RuntimeException e) {
            log.warn("Neuspjelo brisanje objekta {}: {}", key, e.getMessage());
        }
    }

    public String publicUrl(String key) {
        if (!StringUtils.hasText(key)) {
            return null;
        }
        return publicBaseUrl + "/" + key;
    }

    private void put(String key, byte[] bytes, String contentType) {
        s3Client.putObject(PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType)
                        .cacheControl("public, max-age=31536000, immutable")
                        .build(),
                RequestBody.fromBytes(bytes));
    }

    private byte[] readBytes(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Fajl je prazan.");
        }
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Ne mogu procitati fajl.");
        }
    }

    private String resolveExtension(MultipartFile file) {
        String ct = file.getContentType();
        if (ct != null) {
            switch (ct) {
                case "image/jpeg" -> {
                    return "jpg";
                }
                case "image/png" -> {
                    return "png";
                }
                case "image/webp" -> {
                    return "webp";
                }
                case "image/avif" -> {
                    return "avif";
                }
                default -> {
                    // padni na ekstenziju iz imena
                }
            }
        }
        String name = file.getOriginalFilename();
        if (name != null && name.contains(".")) {
            String ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
            if (ext.matches("[a-z0-9]{2,5}")) {
                return "jpeg".equals(ext) ? "jpg" : ext;
            }
        }
        throw new BadRequestException("Nepodrzan tip fajla. Dozvoljene su slike (jpg, png, webp).");
    }

    private String resolveContentType(MultipartFile file, String ext) {
        String ct = file.getContentType();
        if (StringUtils.hasText(ct) && ct.startsWith("image/")) {
            return ct;
        }
        return switch (ext) {
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            case "avif" -> "image/avif";
            default -> "image/jpeg";
        };
    }
}
