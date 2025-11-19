package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.chat.ChatResponse;
import iuh.fit.ecommerce.dtos.response.chat.MessageResponse;
import iuh.fit.ecommerce.entities.Chat;
import iuh.fit.ecommerce.entities.Message;
import iuh.fit.ecommerce.repositories.MessageRepository;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {MessageMapper.class})
public abstract class ChatMapper {

    @Autowired
    protected MessageRepository messageRepository;
    @Autowired
    protected MessageMapper messageMapper;


    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "staffId", source = "staff.id")
    @Mapping(target = "staffName", source = "staff.fullName")
    @Mapping(target = "staffEmail", source = "staff.email")
    @Mapping(target = "messages", ignore = true)
    @Mapping(target = "lastMessage", ignore = true)
    @Mapping(target = "unreadCount", ignore = true)
    public abstract ChatResponse toResponse(Chat chat);

    @AfterMapping
    protected void setMessagesAndLastMessage(Chat chat, @MappingTarget ChatResponse response) {
        List<Message> messages = messageRepository.findByChatIdWithSenderOrderByCreatedAtAsc(chat.getId());
        List<MessageResponse> messageResponses = messages.stream()
                .map(message -> messageMapper.toResponse(message))
                .collect(Collectors.toList());
        response.setMessages(messageResponses);

        if (!messageResponses.isEmpty()) {
            response.setLastMessage(messageResponses.getLast());
        }

        response.setUnreadCount(0L);
    }

    // Helper method to set unread count for specific user
    public void setUnreadCountForUser(ChatResponse response, Long userId) {
        if (userId != null && response != null) {
            Long unreadCount = messageRepository.countUnreadMessagesByChatIdNotFromUserId(
                    response.getId(), 
                    userId
            );
            response.setUnreadCount(unreadCount);
        }
    }

}

