package iuh.fit.ecommerce.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductVariantDescriptionResponse;
import iuh.fit.ecommerce.services.ProductService;
import iuh.fit.ecommerce.services.ProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import iuh.fit.ecommerce.dtos.request.product.ProductAddRequest;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/products")
@RequiredArgsConstructor
@Tag(name = "Product Controller", description = "Controller for managing products")
public class ProductController {
    private final ProductService productService;
    private final ProductVariantService productVariantService;

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<?>> createProduct(@Valid @RequestBody ProductAddRequest productAddRequest) {
        productService.createProduct(productAddRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create product success",
                null
        ));
    }

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ProductResponse>>>> getAllProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int size
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all products success",
                productService.getAllProducts(page, size)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<ProductResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get product detail success",
                productService.getProductById(id)
        ));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ResponseSuccess<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get product detail by slug success",
                productService.getProductBySlug(slug)
        ));
    }

    @GetMapping("/{productId}/skus")
    public ResponseEntity<ResponseSuccess<List<ProductVariantDescriptionResponse>>> getSkusForPromotion(@PathVariable Long productId) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all products success",
                productVariantService.getAllSkusForPromotion(productId)
        ));

    }

}