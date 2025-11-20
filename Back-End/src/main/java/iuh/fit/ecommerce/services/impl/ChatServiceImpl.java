package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.chat.ChatRequest;
import iuh.fit.ecommerce.dtos.request.chat.MessageRequest;
import iuh.fit.ecommerce.dtos.response.chat.ChatResponse;
import iuh.fit.ecommerce.dtos.response.chat.MessageResponse;
import iuh.fit.ecommerce.entities.*;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.ChatMapper;
import iuh.fit.ecommerce.mappers.MessageMapper;
import iuh.fit.ecommerce.repositories.ChatRepository;
import iuh.fit.ecommerce.repositories.MessageRepository;
import iuh.fit.ecommerce.services.ChatService;
import iuh.fit.ecommerce.services.CustomerService;
import iuh.fit.ecommerce.services.StaffService;
import iuh.fit.ecommerce.services.UserService;
import iuh.fit.ecommerce.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final CustomerService customerService;
    private final StaffService staffService;
    private final UserService userService;
    private final ChatMapper chatMapper;
    private final MessageMapper messageMapper;
    private final SecurityUtils securityUtil;

    @Override
    @Transactional
    public ChatResponse createChat(ChatRequest chatRequest) {
         Customer customer =customerService.getCustomerEntityById(chatRequest.getCustomerId());

        if (chatRepository.existsByCustomerId(chatRequest.getCustomerId())) {
            throw new IllegalStateException("Chat already exists for this customer");
        }
        
        Chat chat = Chat.builder()
                .customer(customer)
                .build();
        
        if (chatRequest.getStaffId() != null) {
            Staff staff = staffService.getStaffEntityById(chatRequest.getStaffId());
            chat.setStaff(staff);
        }
        
        Chat savedChat = chatRepository.save(chat);
        return chatMapper.toResponse(savedChat);
    }
    
    @Override
    public ChatResponse getChatById(Long chatId) {
        Chat chat = getChatEntityById(chatId);
        return chatMapper.toResponse(chat);
    }
    
    @Override
    public ChatResponse getChatByCustomerId(Long customerId) {
        Chat chat = chatRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found for customer id: " + customerId));
        ChatResponse response = chatMapper.toResponse(chat);
        chatMapper.setUnreadCountForUser(response, customerId);
        return response;
    }
    
    @Override
    public List<ChatResponse> getChatsByStaffId(Long staffId) {
        List<Chat> chats = chatRepository.findByStaffId(staffId);
        return chats.stream()
                .map(chat -> {
                    ChatResponse response = chatMapper.toResponse(chat);
                    chatMapper.setUnreadCountForUser(response, staffId);
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ChatResponse> getAllChats() {
        List<Chat> chats = chatRepository.findAll();

        User currentUser = securityUtil.getCurrentUser();
        
        return chats.stream()
                .map(chat -> {
                    ChatResponse response = chatMapper.toResponse(chat);
                    chatMapper.setUnreadCountForUser(response, currentUser.getId());
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ChatResponse> getUnassignedChats() {
        List<Chat> chats = chatRepository.findUnassignedChats();
        User currentUser = securityUtil.getCurrentUser();
        
        return chats.stream()
                .map(chat -> {
                    ChatResponse response = chatMapper.toResponse(chat);
                    // Set unread count for current staff viewing
                    chatMapper.setUnreadCountForUser(response, currentUser.getId());
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ChatResponse assignStaffToChat(Long chatId, Long staffId) {
        Chat chat = getChatEntityById(chatId);

        Staff staff = staffService.getStaffEntityById(staffId);

        chat.setStaff(staff);
        Chat updatedChat = chatRepository.save(chat);
        return chatMapper.toResponse(updatedChat);
    }

    private Chat getChatEntityById(Long chatId) {
        return chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found with id: " + chatId));
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(MessageRequest messageRequest) {
        Chat chat = getChatEntityById(messageRequest.getChatId());
        User sender = userService.getUserEntityById(messageRequest.getSenderId());

        Message message = Message.builder()
                .content(messageRequest.getContent())
                .messageType(messageRequest.getMessageType())
                .status(false) // Mặc định là chưa đọc
                .chat(chat)
                .sender(sender)
                .build();
        
        Message savedMessage = messageRepository.save(message);
        return messageMapper.toResponse(savedMessage);
    }
    
    @Override
    public List<MessageResponse> getMessagesByChatId(Long chatId) {
        if (!chatRepository.existsById(chatId)) {
            throw new ResourceNotFoundException("Chat not found with id: " + chatId);
        }
        
        List<Message> messages = messageRepository.findByChatIdOrderByCreatedAtAsc(chatId);
        return messages.stream()
                .map(messageMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markMessagesAsReadByCustomer(Long chatId) {
        User currentUser = securityUtil.getCurrentUser();
        Chat chat = getChatEntityById(chatId);

        if (!chat.getCustomer().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("User is not the customer of this chat");
        }

        Optional<Message> lastMessageOptional = messageRepository.findTopByChat_IdOrderByCreatedAtDesc(chatId);
        if (lastMessageOptional.isEmpty()) {
            throw new ResourceNotFoundException("No messages found in chat with id: " + chatId);
        }

        Message lastMessage = lastMessageOptional.get();
        if (lastMessage.getSender().getId().equals(currentUser.getId())) {
            return;
        }
        messageRepository.markMessagesAsRead(chatId);
    }


    @Override
    @Transactional
    public void markMessagesAsReadByStaff(Long chatId) {
        User currentUser = securityUtil.getCurrentUser();
        Chat chat = getChatEntityById(chatId);

        if (chat.getStaff() == null) {
            throw new IllegalStateException("Chat has no staff assigned");
        }

        if (!chat.getStaff().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("Staff is not assigned to this chat");
        }

        Optional<Message> lastMessageOptional = messageRepository.findTopByChat_IdOrderByCreatedAtDesc(chatId);
        if (lastMessageOptional.isEmpty()) {
            throw new ResourceNotFoundException("No messages found in chat with id: " + chatId);
        }

        Message lastMessage = lastMessageOptional.get();
        if (lastMessage.getSender().getId().equals(currentUser.getId())) {
            return;
        }

        messageRepository.markMessagesAsRead(chatId);
    }

    
    @Override
    public Long getUnreadMessageCount(Long chatId, Long userId) {
        if (!chatRepository.existsById(chatId)) {
            throw new ResourceNotFoundException("Chat not found with id: " + chatId);
        }
        return messageRepository.countUnreadMessagesByChatIdNotFromUserId(chatId, userId);
    }
}

