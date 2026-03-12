package com.chatbot.backend.controller;

import com.chatbot.backend.model.ChatMessage;
import com.chatbot.backend.model.ChatSession;
import com.chatbot.backend.repository.ChatMessageRepository;
import com.chatbot.backend.repository.ChatSessionRepository;
import com.chatbot.backend.service.ChatEngineService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow localhost Vite to connect
public class ChatController {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final ChatEngineService chatEngineService;

    @Data
    public static class ChatRequest {
        private String sessionId;
        private String message;
    }

    @Data
    public static class ChatResponse {
        private String sessionId;
        private String reply;
        private String sentiment; // For demonstration
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        // 1. Get or create session
        String sId = request.getSessionId() != null ? request.getSessionId() : UUID.randomUUID().toString();

        ChatSession session = sessionRepository.findBySessionId(sId).orElseGet(() -> {
            ChatSession newSession = new ChatSession();
            newSession.setSessionId(sId);
            return sessionRepository.save(newSession);
        });

        // 2. Save User Message
        ChatMessage userMsg = new ChatMessage();
        userMsg.setChatSession(session);
        userMsg.setContent(request.getMessage());
        userMsg.setSenderRole("USER");
        messageRepository.save(userMsg);

        // 3. Process through AI Engine
        // (Temporary mock response here)
        String botReply = chatEngineService.getTemporaryReply(request.getMessage());

        // 4. Save Bot Message
        ChatMessage botMsg = new ChatMessage();
        botMsg.setChatSession(session);
        botMsg.setContent(botReply);
        botMsg.setSenderRole("BOT");
        messageRepository.save(botMsg);

        // 5. Return response
        ChatResponse response = new ChatResponse();
        response.setSessionId(sId);
        response.setReply(botReply);
        response.setSentiment(session.getCurrentSentiment());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getHistory(@PathVariable String sessionId) {
        return ResponseEntity.ok(messageRepository.findByChatSession_SessionIdOrderBySentAtAsc(sessionId));
    }
}
