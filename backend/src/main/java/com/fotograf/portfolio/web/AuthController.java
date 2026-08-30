package com.fotograf.portfolio.web;

import com.fotograf.portfolio.dto.LoginRequest;
import com.fotograf.portfolio.dto.LoginResponse;
import com.fotograf.portfolio.security.AdminAuthService;
import com.fotograf.portfolio.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminAuthService adminAuthService;
    private final JwtService jwtService;

    public AuthController(AdminAuthService adminAuthService, JwtService jwtService) {
        this.adminAuthService = adminAuthService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        if (!adminAuthService.matches(req.username(), req.password())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = jwtService.generateToken(req.username());
        return ResponseEntity.ok(new LoginResponse(token, req.username(), jwtService.getExpirationSeconds()));
    }
}
