package iuh.fit.ecommerce.dtos.response.ai;

import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatAIResponse {
    private String message;
    private String role; // "assistant" hoặc "system"
    private List<ProductResponse> products; // Danh sách sản phẩm được AI tìm thấy
}

