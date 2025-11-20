package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.ai.ChatAIResponse;
import iuh.fit.ecommerce.dtos.response.ai.ChatHistoryMessage;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.repositories.CustomerRepository;
import iuh.fit.ecommerce.repositories.OrderRepository;
import iuh.fit.ecommerce.repositories.ProductRepository;
import iuh.fit.ecommerce.services.AIService;
import iuh.fit.ecommerce.services.ChatMemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
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

    @Override
    public ChatAIResponse chat(String message, Long customerId, String sessionId) {
        // Lấy conversation history (10 tin nhắn gần nhất)
        List<ChatHistoryMessage> conversationHistory = chatMemoryService.getRecentMessages(sessionId, 10);
        
        // Xây dựng context (có thể null nếu chưa đăng nhập)
        String context = (customerId != null) 
                ? buildContextForCustomer(customerId)
                : buildContextForGuest();

        // Xây dựng conversation history string
        String historyString = buildConversationHistory(conversationHistory);

        String promptTemplateString = """
                Chào bạn! 😊
                
                Tôi là trợ lý ảo thông minh của cửa hàng điện thoại Ecommerce.
                
                Nhiệm vụ của tôi:
                - Tư vấn sản phẩm phù hợp với nhu cầu của bạn
                - Trả lời câu hỏi về đơn hàng và trạng thái giao hàng
                - Hướng dẫn về sử dụng, bảo hành, đổi trả sản phẩm
                - Hỗ trợ bạn một cách lịch sự, nhiệt tình và chuyên nghiệp
                
                Thông tin khách hàng và sản phẩm:
                {context}
                
                Lịch sử hội thoại gần đây:
                {history}
                
                Câu hỏi hiện tại của bạn: {question}
                
                Lưu ý khi trả lời:
                - Trả lời ngắn gọn, dễ hiểu, thân thiện
                - Dựa vào lịch sử hội thoại để hiểu ngữ cảnh tốt hơn
                - Chỉ tư vấn dựa trên thông tin có sẵn ở trên
                - Nếu không chắc chắn, hãy đề xuất bạn liên hệ nhân viên hỗ trợ trực tiếp
                - Sử dụng emoji phù hợp để tạo sự gần gũi
                - KHÔNG sử dụng markdown formatting (**, *, #, ##, etc)
                - Chỉ trả lời bằng plain text với emoji
                
                Hãy trả lời câu hỏi một cách tốt nhất nhé!
                """;

        // Tạo prompt với template
        PromptTemplate promptTemplate = new PromptTemplate(promptTemplateString);
        Prompt prompt = promptTemplate.create(Map.of(
                "context", context,
                "history", historyString,
                "question", message
        ));

        // Gọi AI model
        String response = chatModel.call(prompt)
                .getResult()
                .getOutput()
                .getText();

        // Lưu user message vào history
        chatMemoryService.addMessage(sessionId, "user", message);
        
        // Lưu AI response vào history
        chatMemoryService.addMessage(sessionId, "assistant", response);

        return ChatAIResponse.builder()
                .message(response)
                .role("assistant")
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
        
        context.append("Khách: Khách vãng lai (chưa đăng nhập)\n\n");
        
        // Chỉ hiển thị sản phẩm nổi bật
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

