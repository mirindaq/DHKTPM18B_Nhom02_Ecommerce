package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.feedback.CreateFeedbackRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.feedback.FeedbackResponse;
import iuh.fit.ecommerce.services.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
}
