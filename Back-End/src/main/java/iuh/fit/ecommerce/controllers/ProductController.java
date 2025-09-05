package iuh.fit.ecommerce.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import iuh.fit.ecommerce.dtos.request.product.ProductAddRequest;

@RestController
@RequestMapping("${api.prefix}/products")
@RequiredArgsConstructor
@Tag(name = "Product Controller", description = "Controller for managing products")
public class ProductController {

    @PostMapping("/create")
    public String createProduct(@Valid @RequestBody ProductAddRequest productAddRequest) {
        // Logic to create a product
        return "Product created successfully";
    }

}
