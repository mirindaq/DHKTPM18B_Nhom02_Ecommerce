package iuh.fit.ecommerce.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.fit.ecommerce.dtos.request.chat.ChatRequest;
import iuh.fit.ecommerce.dtos.request.chat.MessageRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.chat.ChatResponse;
import iuh.fit.ecommerce.dtos.response.chat.MessageResponse;
import iuh.fit.ecommerce.services.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/chats")
@RequiredArgsConstructor
@Tag(name = "Chat Controller", description = "Controller for managing chat between customers and staff")
public class ChatController {
    
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<ChatResponse>> createChat(
            @Valid @RequestBody ChatRequest chatRequest
    ) {
        ChatResponse chatResponse = chatService.createChat(chatRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Chat created successfully",
                chatResponse
        ));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<ChatResponse>> getChatById(@PathVariable Long id) {
        ChatResponse chatResponse = chatService.getChatById(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get chat successfully",
                chatResponse
        ));
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ResponseSuccess<ChatResponse>> getChatByCustomerId(
            @PathVariable Long customerId
    ) {
        ChatResponse chatResponse = chatService.getChatByCustomerId(customerId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get chat by customer successfully",
                chatResponse
        ));
    }
    
    @GetMapping("/staff/{staffId}")
    public ResponseEntity<ResponseSuccess<List<ChatResponse>>> getChatsByStaffId(
            @PathVariable Long staffId
    ) {
        List<ChatResponse> chatResponses = chatService.getChatsByStaffId(staffId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get chats by staff successfully",
                chatResponses
        ));
    }
    
    @GetMapping("")
    public ResponseEntity<ResponseSuccess<List<ChatResponse>>> getAllChats() {
        List<ChatResponse> chatResponses = chatService.getAllChats();
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all chats successfully",
                chatResponses
        ));
    }
    
    @GetMapping("/unassigned")
    public ResponseEntity<ResponseSuccess<List<ChatResponse>>> getUnassignedChats() {
        List<ChatResponse> chatResponses = chatService.getUnassignedChats();
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get unassigned chats successfully",
                chatResponses
        ));
    }
    
    @PutMapping("/{chatId}/assign/{staffId}")
    public ResponseEntity<ResponseSuccess<ChatResponse>> assignStaffToChat(
            @PathVariable Long chatId,
            @PathVariable Long staffId
    ) {
        ChatResponse chatResponse = chatService.assignStaffToChat(chatId, staffId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Staff assigned to chat successfully",
                chatResponse
        ));
    }
    
    @GetMapping("/{chatId}/messages")
    public ResponseEntity<ResponseSuccess<List<MessageResponse>>> getMessagesByChatId(
            @PathVariable Long chatId
    ) {
        List<MessageResponse> messages = chatService.getMessagesByChatId(chatId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get messages successfully",
                messages
        ));
    }
    
    @PutMapping("/{chatId}/read")
    public ResponseEntity<ResponseSuccess<Void>> markMessagesAsRead(@PathVariable Long chatId) {
        chatService.markMessagesAsRead(chatId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Messages marked as read",
                null
        ));
    }
    
    @GetMapping("/{chatId}/unread-count")
    public ResponseEntity<ResponseSuccess<Long>> getUnreadMessageCount(@PathVariable Long chatId) {
        Long count = chatService.getUnreadMessageCount(chatId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get unread message count successfully",
                count
        ));
    }
    
    // WebSocket Endpoints
    
    @MessageMapping("/chat.send")
    @SendTo("/topic/messages")
    public MessageResponse sendMessage(@Payload MessageRequest messageRequest) {
        MessageResponse messageResponse = chatService.sendMessage(messageRequest);
        
        // Gửi tin nhắn đến topic cụ thể của chat
        messagingTemplate.convertAndSend(
                "/topic/chat/" + messageRequest.getChatId(),
                messageResponse
        );
        
        return messageResponse;
    }
    
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/users")
    public MessageRequest addUser(@Payload MessageRequest messageRequest) {
        // Thông báo user đã join chat
        return messageRequest;
    }
}
