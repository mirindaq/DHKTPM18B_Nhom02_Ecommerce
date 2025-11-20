package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.ai.ChatHistoryMessage;

import java.util.List;

public interface ChatMemoryService {
    void addMessage(String sessionId, String role, String content);
    List<ChatHistoryMessage> getRecentMessages(String sessionId, int limit);
    void clearHistory(String sessionId);
}

