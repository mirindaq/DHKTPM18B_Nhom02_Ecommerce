package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.ai.ChatAIResponse;
import iuh.fit.ecommerce.dtos.response.ai.ChatHistoryMessage;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.ProductMapper;
import iuh.fit.ecommerce.repositories.CustomerRepository;
import iuh.fit.ecommerce.repositories.OrderRepository;
import iuh.fit.ecommerce.repositories.ProductRepository;
import iuh.fit.ecommerce.services.AIService;
import iuh.fit.ecommerce.services.ChatMemoryService;
import iuh.fit.ecommerce.services.VectorStoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ChatModel chatModel;
    private final ChatMemoryService chatMemoryService;
    private final VectorStoreService vectorStoreService;
    private final ProductMapper productMapper;

    @Override
    public ChatAIResponse chat(String message, Long customerId, String sessionId) {
        List<ChatHistoryMessage> conversationHistory = chatMemoryService.getRecentMessages(sessionId, 10);
        
        List<String> relevantProducts = vectorStoreService.searchSimilarProducts(message, 5);
        String productsContext = relevantProducts.isEmpty() 
                ? "(Không tìm thấy sản phẩm liên quan)" 
                : String.join("\n---\n", relevantProducts);
            
        String context = (customerId != null) 
                ? buildContextForCustomer(customerId)
                : buildContextForGuest();

        String historyString = buildConversationHistory(conversationHistory);
        

        String promptTemplateString = """
            Chào bạn! Tôi là trợ lý ảo của Ecomstore.
        
            Nhiệm vụ của tôi:
            - Tư vấn sản phẩm
            - Trả lời câu hỏi về đơn hàng, giao hàng
            - Hướng dẫn sử dụng, bảo hành, đổi trả
            - Hỗ trợ một cách chuyên nghiệp
        
            Thông tin khách hàng: {context}
            Sản phẩm liên quan: {products}
            Lịch sử hội thoại gần đây: {history}
            Câu hỏi hiện tại: {question}
        
            Lưu ý:
            - Trả lời ngắn gọn, dễ hiểu, thân thiện
            - Dựa vào lịch sử hội thoại và thông tin có sẵn
            - Nếu bạn chưa đăng nhập, vui lòng đăng nhập để nhận hỗ trợ tốt hơn
            - Nếu không chắc chắn, đề xuất liên hệ nhân viên hỗ trợ
            - KHÔNG dùng markdown
            - Trả lời bằng plain text
        """;


        PromptTemplate promptTemplate = new PromptTemplate(promptTemplateString);
        Prompt prompt = promptTemplate.create(Map.of(
                "context", context,
                "products", productsContext,
                "history", historyString,
                "question", message
        ));
        String response = chatModel.call(prompt)
                .getResult()
                .getOutput()
                .getText();
        chatMemoryService.addMessage(sessionId, "user", message);
        
        chatMemoryService.addMessage(sessionId, "assistant", response);

        String lowerMessage = message.toLowerCase();
        boolean isProductRelated = lowerMessage.contains("sản phẩm") 
                || lowerMessage.contains("mua") 
                || lowerMessage.contains("giá") 
                || lowerMessage.contains("tìm")
                || lowerMessage.contains("có")
                || lowerMessage.contains("nào")
                || lowerMessage.contains("gợi ý")
                || lowerMessage.contains("khuyên")
                || lowerMessage.contains("phù hợp");

        List<ProductResponse> productResponses = new ArrayList<>();
        
        if (isProductRelated) {
            List<Long> productIds = vectorStoreService.searchSimilarProductIds(message, 2);
            List<Product> products = new ArrayList<>();
            if (!productIds.isEmpty()) {
                products = productRepository.findAllById(productIds);
            }

            productResponses = products.stream()
                    .map(productMapper::toResponse)
                    .collect(Collectors.toList());
        }

        return ChatAIResponse.builder()
                .message(response)
                .role("assistant")
                .products(productResponses)
                .build();
    }

    private String buildConversationHistory(List<ChatHistoryMessage> history) {
        if (history == null || history.isEmpty()) {
            return "(Chưa có lịch sử hội thoại)";
        }
        
        return history.stream()
                .map(msg -> {
                    String role = "user".equals(msg.getRole()) ? "Khách hàng" : "Trợ lý AI";
                    return role + ": " + msg.getContent();
                })
                .collect(Collectors.joining("\n"));
    }

    private String buildContextForCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        
        StringBuilder context = new StringBuilder();

        // Thông tin khách hàng
        context.append("Khách hàng: ").append(customer.getFullName()).append("\n");
        context.append("Email: ").append(customer.getEmail()).append("\n\n");

        // Đơn hàng gần nhất
        List<Order> recentOrders = orderRepository.findByCustomerId(
                customer.getId(),
                PageRequest.of(0, 3)
        );

        if (!recentOrders.isEmpty()) {
            context.append("Đơn hàng gần đây của khách:\n");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            for (Order order : recentOrders) {
                context.append("  - Đơn ").append(order.getId())
                        .append(" (").append(order.getCreatedAt().format(formatter)).append(")")
                        .append("\n    Trạng thái: ").append(getOrderStatusText(order.getStatus()))
                        .append("\n    Tổng tiền: ").append(String.format("%,.0fđ", order.getTotalPrice()))
                        .append("\n    Sản phẩm:\n");

                // Chi tiết sản phẩm trong đơn
                order.getOrderDetails().forEach(detail -> {
                    context.append("      + ").append(detail.getProductVariant().getProduct().getName())
                            .append(" x").append(detail.getQuantity())
                            .append(" - ").append(String.format("%,.0fđ", detail.getPrice()))
                            .append("\n");
                });
                context.append("\n");
            }
        }

        // Sản phẩm nổi bật
        List<Product> topProducts = productRepository.findAll(PageRequest.of(0, 10))
                .getContent();

        if (!topProducts.isEmpty()) {
            context.append("Sản phẩm nổi bật hiện có:\n");
            for (Product product : topProducts) {
                Double minPrice = findMinPrice(product);
                context.append("  - ").append(product.getName())
                        .append(" (").append(product.getBrand().getName()).append(")")
                        .append("\n    Giá từ: ").append(String.format("%,.0fđ", minPrice))
                        .append("\n    Danh mục: ").append(product.getCategory().getName())
                        .append("\n");
            }
        }

        return context.toString();
    }

    private String buildContextForGuest() {
        StringBuilder context = new StringBuilder();
        
        context.append("Khách: Khách vãng lai (chưa đăng nhập)\n");
        
        return context.toString();
    }

    private String getOrderStatusText(iuh.fit.ecommerce.enums.OrderStatus status) {
        return switch (status) {
            case PENDING -> "⏳ Chờ xử lý";
            case PROCESSING -> "🔄 Đang xử lý";
            case READY_FOR_PICKUP -> "📦 Sẵn sàng lấy hàng";
            case SHIPPED -> "🚚 Đang giao hàng";
            case COMPLETED -> "✅ Hoàn thành";
            case CANCELED -> "❌ Đã hủy";
            default -> status.name();
        };
    }

    private Double findMinPrice(Product product) {
        return product.getProductVariants().stream()
                .map(ProductVariant::getPrice)
                .min(Double::compare)
                .orElse(0.0);
    }
}

