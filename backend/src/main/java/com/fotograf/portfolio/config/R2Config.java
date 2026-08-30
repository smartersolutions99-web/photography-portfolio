package com.fotograf.portfolio.config;

import java.net.URI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

/**
 * Cloudflare R2 je S3-kompatibilan, pa koristimo AWS S3 SDK v2 sa
 * override-ovanim endpoint-om i regionom "auto".
 *
 * Ako R2 nije konfigurisan (prazni kljucevi), klijent se svejedno kreira sa
 * placeholder kredencijalima da aplikacija moze da se digne — upload slika ce
 * raditi tek kad se popune pravi R2 podaci.
 */
@Configuration
public class R2Config {

    private static final Logger log = LoggerFactory.getLogger(R2Config.class);

    @Bean
    public S3Client s3Client(
            @Value("${app.r2.account-id}") String accountId,
            @Value("${app.r2.access-key-id}") String accessKeyId,
            @Value("${app.r2.secret-access-key}") String secretAccessKey) {

        boolean configured = StringUtils.hasText(accountId)
                && StringUtils.hasText(accessKeyId)
                && StringUtils.hasText(secretAccessKey);
        if (!configured) {
            log.warn("Cloudflare R2 nije konfigurisan (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY). "
                    + "Aplikacija ce se pokrenuti, ali upload slika nece raditi dok ne popunis R2 podatke.");
        }

        String host = StringUtils.hasText(accountId) ? accountId : "not-configured";
        String keyId = StringUtils.hasText(accessKeyId) ? accessKeyId : "not-configured";
        String secret = StringUtils.hasText(secretAccessKey) ? secretAccessKey : "not-configured";

        return S3Client.builder()
                .endpointOverride(URI.create("https://" + host + ".r2.cloudflarestorage.com"))
                .region(Region.of("auto"))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(keyId, secret)))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .build();
    }
}
