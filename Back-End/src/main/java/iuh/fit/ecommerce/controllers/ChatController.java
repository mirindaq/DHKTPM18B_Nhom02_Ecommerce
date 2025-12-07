package iuh.fit.ecommerce.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.fit.ecommerce.dtos.request.chat.BulkTransferChatRequest;
import iuh.fit.ecommerce.dtos.request.chat.BulkUnassignChatRequest;
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
    
//    @GetMapping("/{id}")
//    public ResponseEntity<ResponseSuccess<ChatResponse>> getChatById(@PathVariable Long id) {
//        ChatResponse chatResponse = chatService.getChatById(id);
//        return ResponseEntity.ok(new ResponseSuccess<>(
//                OK,
//                "Get chat successfully",
//                chatResponse
//        ));
//    }


    @GetMapping("/my-chat")
    public ResponseEntity<ResponseSuccess<ChatResponse>> getMyChat() {
        ChatResponse chatResponse = chatService.getMyChat();
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get my chat successfully",
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
    public ResponseEntity<ResponseSuccess<Void>> assignStaffToChat(
            @PathVariable Long chatId,
            @PathVariable Long staffId
    ) {
        chatService.assignStaffToChat(chatId, staffId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Staff assigned to chat successfully",
                null
        ));
    }
    
    @PutMapping("/{chatId}/unassign")
    public ResponseEntity<ResponseSuccess<Void>> unassignStaffFromChat(
            @PathVariable Long chatId
    ) {
        chatService.unassignStaffFromChat(chatId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Staff unassigned from chat successfully",
                null
        ));
    }
    
    @PutMapping("/bulk-transfer")
    public ResponseEntity<ResponseSuccess<Void>> bulkTransferChats(
            @Valid @RequestBody BulkTransferChatRequest request
    ) {
        chatService.bulkTransferChats(
                request.getChatIds(), 
                request.getStaffId()
        );
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Chats transferred successfully",
                null
        ));
    }
    
    @PutMapping("/bulk-unassign")
    public ResponseEntity<ResponseSuccess<Void>> bulkUnassignChats(
            @Valid @RequestBody BulkUnassignChatRequest request
    ) {
        chatService.bulkUnassignChats(request.getChatIds());
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Chats returned to pool successfully",
                null
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
    
    @PutMapping("/{chatId}/read/customer")
    public ResponseEntity<ResponseSuccess<Void>> markMessagesAsReadByCustomer(@PathVariable Long chatId) {
        chatService.markMessagesAsReadByCustomer(chatId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Messages marked as read by customer",
                null
        ));
    }
    
    @PutMapping("/{chatId}/read/staff")
    public ResponseEntity<ResponseSuccess<Void>> markMessagesAsReadByStaff(@PathVariable Long chatId) {
        chatService.markMessagesAsReadByStaff(chatId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Messages marked as read by staff",
                null
        ));
    }

    @GetMapping("/{chatId}/unread-count/{userId}")
    public ResponseEntity<ResponseSuccess<Long>> getUnreadMessageCount(
            @PathVariable Long chatId,
            @PathVariable Long userId) {

        Long count = chatService.getUnreadMessageCount(chatId, userId);

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get unread message count successfully",
                count
        ));
    }


    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest messageRequest) {
        MessageResponse messageResponse = chatService.sendMessage(messageRequest);

        messagingTemplate.convertAndSend(
                "/topic/chat/" + messageRequest.getChatId(),
                messageResponse
        );
    }

}
