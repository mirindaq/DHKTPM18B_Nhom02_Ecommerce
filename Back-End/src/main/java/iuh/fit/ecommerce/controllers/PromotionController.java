package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.promotion.PromotionAddRequest;
import iuh.fit.ecommerce.dtos.request.promotion.PromotionUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.promotion.PromotionResponse;
import iuh.fit.ecommerce.services.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<PromotionResponse>> createPromotion(
            @Valid @RequestBody PromotionAddRequest request
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create Promotion success",
                promotionService.createPromotion(request)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<PromotionResponse>> getPromotionById(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Promotion success",
                promotionService.getPromotionById(id)
        ));
    }

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<PromotionResponse>>>> getAllPromotions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Promotions success",
                promotionService.getAllPromotions(page, limit, name, type, active, startDate, endDate)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseSuccess<PromotionResponse>> updatePromotion(
            @PathVariable Long id,
            @Valid @RequestBody PromotionUpdateRequest request
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update Promotion success",
                promotionService.updatePromotion(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseSuccess<String>> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delete Promotion success",
                "Deleted successfully"
        ));
    }

    @PutMapping("/change-status/{id}")
    public ResponseEntity<ResponseSuccess<Void>> changeStatusPromotion(@PathVariable Long id) {
        promotionService.changeStatusPromotion(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Change status promotion success",
                null
        ));
    }
}
