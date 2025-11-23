package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.chat.ChatRequest;
import iuh.fit.ecommerce.dtos.request.chat.MessageRequest;
import iuh.fit.ecommerce.dtos.response.chat.ChatResponse;
import iuh.fit.ecommerce.dtos.response.chat.MessageResponse;

import java.util.List;

public interface ChatService {
    
    ChatResponse createChat(ChatRequest chatRequest);
    
    ChatResponse getChatById(Long chatId);
    
    ChatResponse getChatByCustomerId(Long customerId);
    
    List<ChatResponse> getChatsByStaffId(Long staffId);
    
    List<ChatResponse> getAllChats();
    
    List<ChatResponse> getUnassignedChats();
    
    ChatResponse assignStaffToChat(Long chatId, Long staffId);
    
    ChatResponse unassignStaffFromChat(Long chatId);
    
    List<ChatResponse> bulkTransferChats(List<Long> chatIds, Long staffId);
    
    List<ChatResponse> bulkUnassignChats(List<Long> chatIds);
    
    MessageResponse sendMessage(MessageRequest messageRequest);
    
    List<MessageResponse> getMessagesByChatId(Long chatId);
    
    void markMessagesAsReadByCustomer(Long chatId);
    
    void markMessagesAsReadByStaff(Long chatId);
    
    Long getUnreadMessageCount(Long chatId, Long userId);
}

