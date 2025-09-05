package iuh.fit.ecommerce.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import iuh.fit.ecommerce.dtos.request.brand.BrandAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.services.BrandService;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<BrandResponse>>>> getBrands(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int size,
            @RequestParam(required = false ) String brandName
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get brands success",
                brandService.getBrands(page, size,brandName )
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<BrandResponse>> getBrandById(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get brand detail success",
                brandService.getBrandById(id)
        ));
    }

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<BrandResponse>> createBrand(
            @Valid @RequestBody BrandAddRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create brand success",
                brandService.createBrand(request)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseSuccess<BrandResponse>> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandAddRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update brand success",
                brandService.updateBrand(id, request)
        ));
    }

    @PutMapping("/change-status/{id}")
    public ResponseEntity<ResponseSuccess<Void>> changeStatusBrand(@PathVariable Long id) {
        brandService.changeStatusBrand(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Change status brand success",
                null
        ));
    }
}
