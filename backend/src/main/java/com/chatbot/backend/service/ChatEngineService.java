package com.chatbot.backend.service;

import org.springframework.stereotype.Service;

@Service
public class ChatEngineService {

    public String getTemporaryReply(String userMessage) {
        return "This is a placeholder reply. OpenAI integration pending. You said: " + userMessage;
    }
}
