package iuh.fit.ecommerce.dtos.request.chat;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkTransferChatRequest {
    
    @NotEmpty(message = "Chat IDs list is required")
    private List<Long> chatIds;
    
    @NotNull(message = "Staff ID is required")
    private Long staffId;
}

