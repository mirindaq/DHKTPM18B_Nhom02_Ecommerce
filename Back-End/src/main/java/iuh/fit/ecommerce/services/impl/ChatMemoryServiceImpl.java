package iuh.fit.ecommerce.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import iuh.fit.ecommerce.dtos.response.ai.ChatHistoryMessage;
import iuh.fit.ecommerce.services.ChatMemoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatMemoryServiceImpl implements ChatMemoryService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String REDIS_KEY_PREFIX = "chat:history:";
    private static final String REDIS_ACTIVITY_PREFIX = "chat:activity:";
    private static final int MAX_HISTORY_SIZE = 15;
    
    // TTL: Xóa session sau 30 phút không hoạt động
    private static final Duration SESSION_TTL = Duration.ofMinutes(30);

    @Override
    public void addMessage(String sessionId, String role, String content) {
        String historyKey = REDIS_KEY_PREFIX + sessionId;
        String activityKey = REDIS_ACTIVITY_PREFIX + sessionId;
        
        // Lấy danh sách messages hiện tại từ Redis
        List<ChatHistoryMessage> messages = getMessagesFromRedis(historyKey);
        
        // Tạo message mới
        ChatHistoryMessage message = ChatHistoryMessage.builder()
                .role(role)
                .content(content)
                .timestamp(LocalDateTime.now())
                .build();
        
        messages.add(message);
        
        // Giữ tối đa MAX_HISTORY_SIZE tin nhắn
        if (messages.size() > MAX_HISTORY_SIZE) {
            messages.remove(0);
        }
        
        // Lưu lại vào Redis
        try {
            redisTemplate.opsForValue().set(historyKey, messages, SESSION_TTL);
            redisTemplate.opsForValue().set(activityKey, LocalDateTime.now().toString(), SESSION_TTL);
        } catch (Exception e) {
            log.error("Error saving message to Redis for session: {}", sessionId, e);
        }
    }

    @Override
    public List<ChatHistoryMessage> getRecentMessages(String sessionId, int limit) {
        String historyKey = REDIS_KEY_PREFIX + sessionId;
        String activityKey = REDIS_ACTIVITY_PREFIX + sessionId;
        
        // Lấy messages từ Redis
        List<ChatHistoryMessage> messages = getMessagesFromRedis(historyKey);
        
        if (messages == null || messages.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Cập nhật thời gian activity khi đọc
        try {
            redisTemplate.opsForValue().set(activityKey, LocalDateTime.now().toString(), SESSION_TTL);
        } catch (Exception e) {
            log.error("Error updating activity timestamp for session: {}", sessionId, e);
        }
        
        // Lấy N tin nhắn gần nhất
        int startIndex = Math.max(0, messages.size() - limit);
        return messages.subList(startIndex, messages.size());
    }

    @Override
    public void clearHistory(String sessionId) {
        String historyKey = REDIS_KEY_PREFIX + sessionId;
        String activityKey = REDIS_ACTIVITY_PREFIX + sessionId;
        
        try {
            redisTemplate.delete(historyKey);
            redisTemplate.delete(activityKey);
        } catch (Exception e) {
            log.error("Error clearing history for session: {}", sessionId, e);
        }
    }
    
    /**
     * Lấy messages từ Redis
     */
    @SuppressWarnings("unchecked")
    private List<ChatHistoryMessage> getMessagesFromRedis(String key) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                return new ArrayList<>();
            }
            
            // GenericJackson2JsonRedisSerializer đã tự động deserialize
            // Nếu value là List, convert sang List<ChatHistoryMessage>
            if (value instanceof List) {
                List<?> rawList = (List<?>) value;
                if (rawList.isEmpty()) {
                    return new ArrayList<>();
                }
                
                // Convert từ List<Map> hoặc List<ChatHistoryMessage> sang List<ChatHistoryMessage>
                return rawList.stream()
                        .map(item -> {
                            if (item instanceof ChatHistoryMessage) {
                                return (ChatHistoryMessage) item;
                            } else {
                                // Nếu là Map (từ JSON), convert sang ChatHistoryMessage
                                return objectMapper.convertValue(item, ChatHistoryMessage.class);
                            }
                        })
                        .collect(Collectors.toList());
            }
            
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Error getting messages from Redis for key: {}", key, e);
            return new ArrayList<>();
        }
    }
}

