package com.chatbot.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession chatSession;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // "USER" or "BOT" or "SYSTEM" or "AGENT"
    @Column(nullable = false)
    private String senderRole;

    private LocalDateTime sentAt = LocalDateTime.now();

    // Specific to user messages, recorded after analysis
    private String intentClassifier;
    private String sentimentScore;
}
