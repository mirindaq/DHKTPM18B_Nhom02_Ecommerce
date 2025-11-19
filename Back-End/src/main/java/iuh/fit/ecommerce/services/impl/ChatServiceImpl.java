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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
        return chatMapper.toResponse(chat);
    }
    
    @Override
    public List<ChatResponse> getChatsByStaffId(Long staffId) {
        List<Chat> chats = chatRepository.findByStaffId(staffId);
        return chats.stream()
                .map(chatMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ChatResponse> getAllChats() {
        List<Chat> chats = chatRepository.findAll();
        return chats.stream()
                .map(chatMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ChatResponse> getUnassignedChats() {
        List<Chat> chats = chatRepository.findUnassignedChats();
        return chats.stream()
                .map(chatMapper::toResponse)
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
    public void markMessagesAsRead(Long chatId) {
        if (!chatRepository.existsById(chatId)) {
            throw new ResourceNotFoundException("Chat not found with id: " + chatId);
        }
        messageRepository.markMessagesAsRead(chatId);
    }
    
    @Override
    public Long getUnreadMessageCount(Long chatId) {
        if (!chatRepository.existsById(chatId)) {
            throw new ResourceNotFoundException("Chat not found with id: " + chatId);
        }
        return messageRepository.countUnreadMessagesByChatId(chatId);
    }
}

