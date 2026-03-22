package com.jumpstart.api.controller;

import com.jumpstart.api.dto.LoginRequest;
import com.jumpstart.api.dto.RegisterRequest;
import com.jumpstart.api.dto.UserDto;
import com.jumpstart.api.service.JWTService;
import com.jumpstart.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest request) {
        UserDto user = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        com.jumpstart.api.entity.UserPrinciple principal =
                (com.jumpstart.api.entity.UserPrinciple) auth.getPrincipal();

        String token = jwtService.generateToken(principal.getId(), principal.getUsername());
        return ResponseEntity.ok(token);
    }
}
