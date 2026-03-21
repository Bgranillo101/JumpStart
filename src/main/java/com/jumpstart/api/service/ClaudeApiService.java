package com.jumpstart.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ClaudeApiService {

    @Value("${claude.api.key}")
    private String apiKey;

    public String analyzeTeam(String prompt) {
        // TODO: implement Claude API call
        // - POST to https://api.anthropic.com/v1/messages
        // - Set headers: x-api-key, anthropic-version, content-type
        // - Send prompt requesting structured JSON response
        // - Return the response text
        return null;
    }
}
