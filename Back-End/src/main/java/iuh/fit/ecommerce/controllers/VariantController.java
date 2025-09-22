package iuh.fit.ecommerce.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import iuh.fit.ecommerce.dtos.request.variant.VariantAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.variant.VariantResponse;
import iuh.fit.ecommerce.services.VariantService;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/variants")
@RequiredArgsConstructor
public class VariantController {

    private final VariantService variantService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<VariantResponse>>>> getVariants(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int size,
            @RequestParam(required = false) String variantName
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get variants success",
                variantService.getVariants(page, size, variantName)
        ));
    }

    @GetMapping("/category/{id}")
    public ResponseEntity<ResponseSuccess<List<VariantResponse>>> getVariantsByCategory(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get variants by category success",
                variantService.getVariantsByCategory(id)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<VariantResponse>> getVariantById(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get variant detail success",
                variantService.getVariantById(id)
        ));
    }

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<VariantResponse>> createVariant(
            @Valid @RequestBody VariantAddRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create variant success",
                variantService.createVariant(request)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseSuccess<VariantResponse>> updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody VariantAddRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update variant success",
                variantService.updateVariant(id, request)
        ));
    }

    @PutMapping("/change-status/{id}")
    public ResponseEntity<ResponseSuccess<Void>> changeStatusVariant(@PathVariable Long id) {
        variantService.changeStatusVariant(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Change status variant success",
                null
        ));
    }
}
