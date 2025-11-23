package iuh.fit.ecommerce.dtos.request.chat;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkUnassignChatRequest {
    
    @NotEmpty(message = "Chat IDs list is required")
    private List<Long> chatIds;
}

