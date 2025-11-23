package iuh.fit.ecommerce.dtos.response.chat;

import com.fasterxml.jackson.annotation.JsonFormat;
import iuh.fit.ecommerce.enums.MessageType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    
    private Long id;
    private String content;
    private MessageType messageType;
    private Boolean status; // true: đã đọc, false: chưa đọc
    private Long chatId;
    private String senderName;
    private Long senderId;
    private Boolean isStaff;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}

