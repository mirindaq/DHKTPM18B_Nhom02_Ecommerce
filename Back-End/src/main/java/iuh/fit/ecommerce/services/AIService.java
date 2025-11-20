package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.ai.ChatAIResponse;

public interface AIService {
    ChatAIResponse chat(String message, Long customerId, String sessionId);
}

