package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.ai.ChatHistoryMessage;
import iuh.fit.ecommerce.services.ChatMemoryService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class ChatMemoryServiceImpl implements ChatMemoryService {

    // Lưu trữ conversation history trong memory
    // Key: sessionId, Value: List of messages
    private final Map<String, List<ChatHistoryMessage>> conversationHistory = new ConcurrentHashMap<>();
    
    // Lưu thời gian activity cuối cùng của mỗi session
    // Key: sessionId, Value: Last activity timestamp
    private final Map<String, LocalDateTime> sessionLastActivity = new ConcurrentHashMap<>();

    private static final int MAX_HISTORY_SIZE = 15;
    
    // TTL: Xóa session sau 30 phút không hoạt động
    private static final int SESSION_TTL_MINUTES = 30;

    @Override
    public void addMessage(String sessionId, String role, String content) {
        conversationHistory.putIfAbsent(sessionId, new ArrayList<>());
        
        List<ChatHistoryMessage> messages = conversationHistory.get(sessionId);
        
        ChatHistoryMessage message = ChatHistoryMessage.builder()
                .role(role)
                .content(content)
                .timestamp(LocalDateTime.now())
                .build();
        
        messages.add(message);
        
        // Cập nhật thời gian activity
        sessionLastActivity.put(sessionId, LocalDateTime.now());
        
        // Giữ tối đa MAX_HISTORY_SIZE tin nhắn
        if (messages.size() > MAX_HISTORY_SIZE) {
            messages.remove(0);
        }
    }

    @Override
    public List<ChatHistoryMessage> getRecentMessages(String sessionId, int limit) {
        List<ChatHistoryMessage> messages = conversationHistory.get(sessionId);
        
        if (messages == null || messages.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Cập nhật thời gian activity khi đọc
        sessionLastActivity.put(sessionId, LocalDateTime.now());
        
        // Lấy N tin nhắn gần nhất
        int startIndex = Math.max(0, messages.size() - limit);
        return messages.subList(startIndex, messages.size());
    }

    @Override
    public void clearHistory(String sessionId) {
        conversationHistory.remove(sessionId);
        sessionLastActivity.remove(sessionId);
    }
    
    /**
     * Auto cleanup job chạy mỗi 5 phút
     * Xóa các session không hoạt động quá SESSION_TTL_MINUTES
     */
    @Scheduled(fixedRate = 300000) // 5 phút = 300,000ms
    public void cleanupInactiveSessions() {
        LocalDateTime now = LocalDateTime.now();

        List<String> expiredSessions = sessionLastActivity.entrySet().stream()
                .filter(entry -> {
                    LocalDateTime lastActivity = entry.getValue();
                    long minutesSinceLastActivity = java.time.Duration.between(lastActivity, now).toMinutes();
                    return minutesSinceLastActivity > SESSION_TTL_MINUTES;
                })
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        // Xóa các session expired
        for (String sessionId : expiredSessions) {
            conversationHistory.remove(sessionId);
            sessionLastActivity.remove(sessionId);
        }
    }
    

}

