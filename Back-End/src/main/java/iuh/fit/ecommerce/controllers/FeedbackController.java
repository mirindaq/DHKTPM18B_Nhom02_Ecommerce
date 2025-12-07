package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.feedback.CreateFeedbackRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.feedback.FeedbackResponse;
import iuh.fit.ecommerce.dtos.response.feedback.RatingStatisticsResponse;
import iuh.fit.ecommerce.services.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<ResponseSuccess<FeedbackResponse>> createFeedback(
            @Valid @RequestBody CreateFeedbackRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Feedback created successfully",
                feedbackService.createFeedback(request)
        ));
    }

    @GetMapping("/check")
    public ResponseEntity<ResponseSuccess<Boolean>> checkIfReviewed(
            @RequestParam Long orderId,
            @RequestParam Long productVariantId) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Check feedback status success",
                feedbackService.checkIfReviewed(orderId, productVariantId)
        ));
    }

    @GetMapping("/detail")
    public ResponseEntity<ResponseSuccess<FeedbackResponse>> getFeedbackDetail(
            @RequestParam Long orderId,
            @RequestParam Long productVariantId) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get feedback detail success",
                feedbackService.getFeedbackDetail(orderId, productVariantId)
        ));
    }

    // Product page APIs - Public
    @GetMapping("/product/{productId}")
    public ResponseEntity<ResponseSuccess<Page<FeedbackResponse>>> getFeedbacksByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) Integer rating) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get product feedbacks success",
                feedbackService.getFeedbacksByProduct(productId, page, size, rating)
        ));
    }

    @GetMapping("/product/{productId}/statistics")
    public ResponseEntity<ResponseSuccess<RatingStatisticsResponse>> getRatingStatistics(
            @PathVariable Long productId) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get rating statistics success",
                feedbackService.getRatingStatistics(productId)
        ));
    }

    // Admin APIs
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<Page<FeedbackResponse>>> getAllFeedbacks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all feedbacks success",
                feedbackService.getAllFeedbacks(page, size, rating, status, fromDate, toDate)
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<FeedbackResponse>> getFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get feedback success",
                feedbackService.getFeedbackById(id)
        ));
    }

    @PutMapping("/change-status/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> changeStatusFeedback(@PathVariable Long id) {
        feedbackService.changeStatusFeedback(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Change feedback status success",
                null
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delete feedback success",
                null
        ));
    }
}
