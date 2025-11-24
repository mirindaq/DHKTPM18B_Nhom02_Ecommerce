package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.feedback.CreateFeedbackRequest;
import iuh.fit.ecommerce.dtos.response.feedback.FeedbackResponse;

public interface FeedbackService {
    FeedbackResponse createFeedback(CreateFeedbackRequest request);
    boolean checkIfReviewed(Long orderId, Long productVariantId);
    FeedbackResponse getFeedbackDetail(Long orderId, Long productVariantId);
}
