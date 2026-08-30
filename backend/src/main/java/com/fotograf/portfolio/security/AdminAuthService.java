package com.fotograf.portfolio.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Provjera kredencijala jedinog admin naloga.
 * Kredencijali dolaze iz konfiguracije: username + (raw lozinka ILI bcrypt hash).
 */
@Service
public class AdminAuthService {

    private final String username;
    private final String passwordHash;
    private final PasswordEncoder passwordEncoder;

    public AdminAuthService(
            @Value("${app.admin.username}") String username,
            @Value("${app.admin.password:}") String rawPassword,
            @Value("${app.admin.password-hash:}") String passwordHash,
            PasswordEncoder passwordEncoder) {
        this.username = username;
        this.passwordEncoder = passwordEncoder;
        if (StringUtils.hasText(passwordHash)) {
            this.passwordHash = passwordHash;
        } else if (StringUtils.hasText(rawPassword)) {
            this.passwordHash = passwordEncoder.encode(rawPassword);
        } else {
            this.passwordHash = null;
        }
    }

    public boolean matches(String username, String rawPassword) {
        if (passwordHash == null) {
            return false;
        }
        return this.username.equals(username)
                && passwordEncoder.matches(rawPassword, passwordHash);
    }

    public String getUsername() {
        return username;
    }
}
