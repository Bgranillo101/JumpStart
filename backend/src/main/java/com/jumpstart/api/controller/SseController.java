package com.jumpstart.api.controller;

import com.jumpstart.api.service.JWTService;
import com.jumpstart.api.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/startups/{startupId}/events")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;
    private final JWTService jwtService;

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable Long startupId, @RequestParam String token) {
        // Validate the JWT token manually since EventSource can't set headers
        String username = jwtService.extractUserName(token);
        if (username == null || !jwtService.validateToken(token)) {
            throw new IllegalArgumentException("Invalid token");
        }
        return sseService.subscribe(startupId);
    }
}
