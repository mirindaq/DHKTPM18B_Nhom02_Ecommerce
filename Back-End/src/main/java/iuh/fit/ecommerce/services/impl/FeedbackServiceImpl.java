package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.feedback.CreateFeedbackRequest;
import iuh.fit.ecommerce.dtos.response.feedback.FeedbackResponse;
import iuh.fit.ecommerce.dtos.response.feedback.RatingStatisticsResponse;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Feedback;
import iuh.fit.ecommerce.entities.FeedbackImage;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.enums.OrderStatus;
import iuh.fit.ecommerce.exceptions.custom.InvalidParamException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.FeedbackMapper;
import iuh.fit.ecommerce.repositories.FeedbackRepository;
import iuh.fit.ecommerce.repositories.OrderRepository;
import iuh.fit.ecommerce.repositories.ProductVariantRepository;
import iuh.fit.ecommerce.services.FeedbackService;
import iuh.fit.ecommerce.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final SecurityUtils securityUtils;
    private final FeedbackMapper feedbackMapper;

    @Override
    @Transactional
    public FeedbackResponse createFeedback(CreateFeedbackRequest request) {
        Customer customer = securityUtils.getCurrentCustomer();

        // Validate order exists and belongs to customer
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new InvalidParamException("Order does not belong to current customer");
        }

        // Validate order is completed
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new InvalidParamException("Can only review completed orders");
        }

        // Validate product variant exists
        ProductVariant productVariant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

        // Check if already reviewed
        if (feedbackRepository.existsByOrderIdAndProductVariantIdAndCustomerId(
                request.getOrderId(),
                request.getProductVariantId(),
                customer.getId())) {
            throw new InvalidParamException("You have already reviewed this product for this order");
        }

        // Verify product is in order
        boolean productInOrder = order.getOrderDetails().stream()
                .anyMatch(od -> od.getProductVariant().getId().equals(request.getProductVariantId()));

        if (!productInOrder) {
            throw new InvalidParamException("Product variant is not in this order");
        }

        // Create feedback
        Feedback feedback = Feedback.builder()
                .order(order)
                .productVariant(productVariant)
                .customer(customer)
                .rating(request.getRating())
                .comment(request.getComment())
                .images(new ArrayList<>())
                .build();

        // Add images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            final Feedback finalFeedback = feedback;
            List<FeedbackImage> images = request.getImageUrls().stream()
                    .map(url -> FeedbackImage.builder()
                            .imgUrl(url)
                            .feedback(finalFeedback)
                            .build())
                    .toList();
            feedback.getImages().addAll(images);
        }

        feedback = feedbackRepository.save(feedback);

        // Cập nhật rating của Product
        updateProductRating(productVariant.getProduct());

        return feedbackMapper.toResponse(feedback);
    }

    @Override
    public boolean checkIfReviewed(Long orderId, Long productVariantId) {
        Customer customer = securityUtils.getCurrentCustomer();
        return feedbackRepository.existsByOrderIdAndProductVariantIdAndCustomerId(
                orderId,
                productVariantId,
                customer.getId()
        );
    }

    @Override
    public FeedbackResponse getFeedbackDetail(Long orderId, Long productVariantId) {
        Customer customer = securityUtils.getCurrentCustomer();
        
        Feedback feedback = feedbackRepository.findByOrderIdAndProductVariantIdAndCustomerId(
                orderId,
                productVariantId,
                customer.getId()
        ).orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        return feedbackMapper.toResponse(feedback);
    }

    // Product page APIs
    @Override
    public Page<FeedbackResponse> getFeedbacksByProduct(Long productId, int page, int size, Integer rating) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Feedback> feedbacks = feedbackRepository.findByProductIdWithFilters(productId, rating, pageable);
        return feedbacks.map(feedbackMapper::toResponse);
    }

    @Override
    public RatingStatisticsResponse getRatingStatistics(Long productId) {
        Long totalReviews = feedbackRepository.countByProductId(productId);
        Double averageRating = feedbackRepository.getAverageRatingByProductId(productId);
        
        Long fiveStarCount = feedbackRepository.countByProductIdAndRating(productId, 5);
        Long fourStarCount = feedbackRepository.countByProductIdAndRating(productId, 4);
        Long threeStarCount = feedbackRepository.countByProductIdAndRating(productId, 3);
        Long twoStarCount = feedbackRepository.countByProductIdAndRating(productId, 2);
        Long oneStarCount = feedbackRepository.countByProductIdAndRating(productId, 1);

        return RatingStatisticsResponse.builder()
                .productId(productId)
                .totalReviews(totalReviews)
                .averageRating(Math.round(averageRating * 10.0) / 10.0)
                .fiveStarCount(fiveStarCount)
                .fourStarCount(fourStarCount)
                .threeStarCount(threeStarCount)
                .twoStarCount(twoStarCount)
                .oneStarCount(oneStarCount)
                .build();
    }

    // Admin APIs
    @Override
    public Page<FeedbackResponse> getAllFeedbacks(int page, int size, Integer rating, Boolean status, String fromDate, String toDate) {
        Pageable pageable = PageRequest.of(page - 1, size);
        
        // Parse dates if provided
        java.time.LocalDateTime fromDateTime = null;
        java.time.LocalDateTime toDateTime = null;
        
        if (fromDate != null && !fromDate.isEmpty()) {
            try {
                fromDateTime = java.time.LocalDate.parse(fromDate).atStartOfDay();
            } catch (Exception e) {
                // Invalid date format, ignore
            }
        }
        
        if (toDate != null && !toDate.isEmpty()) {
            try {
                toDateTime = java.time.LocalDate.parse(toDate).atTime(23, 59, 59);
            } catch (Exception e) {
                // Invalid date format, ignore
            }
        }
        
        Page<Feedback> feedbacks = feedbackRepository.findAllWithFilters(rating, status, fromDateTime, toDateTime, pageable);
        return feedbacks.map(feedbackMapper::toResponse);
    }

    @Override
    public FeedbackResponse getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        return feedbackMapper.toResponse(feedback);
    }

    @Override
    @Transactional
    public void changeStatusFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        feedback.setStatus(!feedback.getStatus());
        feedbackRepository.save(feedback);
        
        // Cập nhật lại rating của Product khi thay đổi status feedback
        updateProductRating(feedback.getProductVariant().getProduct());
    }

    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        
        Product product = feedback.getProductVariant().getProduct();
        feedbackRepository.deleteById(id);
        
        // Cập nhật lại rating của Product sau khi xóa
        updateProductRating(product);
    }

    /**
     * Cập nhật rating của Product dựa trên tất cả feedbacks
     */
    private void updateProductRating(Product product) {
        // Lấy tất cả feedbacks của product (qua các product variants)
        List<Long> variantIds = product.getProductVariants().stream()
                .map(ProductVariant::getId)
                .toList();
        
        List<Feedback> allFeedbacks = feedbackRepository.findAllByProductVariantIdInAndStatusTrue(variantIds);
        
        if (allFeedbacks.isEmpty()) {
            product.setRating(0.0);
            product.setTotalRating(0.0);
            product.setReviewCount(0);
        } else {
            double totalRating = allFeedbacks.stream()
                    .mapToInt(Feedback::getRating)
                    .sum();
            int reviewCount = allFeedbacks.size();
            double averageRating = totalRating / reviewCount;
            
            product.setRating(Math.round(averageRating * 10.0) / 10.0); // Làm tròn 1 chữ số
            product.setTotalRating(totalRating);
            product.setReviewCount(reviewCount);
        }
        
        // Save product through variant to trigger update
        if (!product.getProductVariants().isEmpty()) {
            productVariantRepository.save(product.getProductVariants().get(0));
        }
    }
}
