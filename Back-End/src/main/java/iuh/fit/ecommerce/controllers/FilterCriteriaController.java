package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.filterCriteria.CreateFilterCriteriaRequest;
import iuh.fit.ecommerce.dtos.request.filterCriteria.SetFilterValuesForCriteriaRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.filterCriteria.FilterCriteriaResponse;
import iuh.fit.ecommerce.dtos.response.filterCriteria.FilterValueResponse;
import iuh.fit.ecommerce.services.FilterCriteriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/filter-criteria")
@RequiredArgsConstructor
public class FilterCriteriaController {

    private final FilterCriteriaService filterCriteriaService;

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<FilterCriteriaResponse>> createFilterCriteria(
            @Valid @RequestBody CreateFilterCriteriaRequest request
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create filter criteria successfully",
                filterCriteriaService.createFilterCriteria(request)
        ));
    }

    @GetMapping("/categories/{categoryId}")
    public ResponseEntity<ResponseSuccess<List<FilterCriteriaResponse>>> getFilterCriteriaByCategoryId(
            @PathVariable Long categoryId,
            @RequestParam(required = false) String name
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get filter criteria by category success",
                filterCriteriaService.getFilterCriteriaByCategoryId(categoryId, name)
        ));
    }

    @GetMapping("/categories/slug/{categorySlug}")
    public ResponseEntity<ResponseSuccess<List<FilterCriteriaResponse>>> getFilterCriteriaByCategorySlug(
            @PathVariable String categorySlug,
            @RequestParam(required = false) String name
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get filter criteria by category slug success",
                filterCriteriaService.getFilterCriteriaByCategorySlug(categorySlug, name)
        ));
    }

    @PostMapping("/set-values")
    public ResponseEntity<ResponseSuccess<Void>> setFilterValuesForCriteria(
            @Valid @RequestBody SetFilterValuesForCriteriaRequest request
    ) {
        filterCriteriaService.setFilterValuesForCriteria(request);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Set filter values for criteria success",
                null
        ));
    }

    @GetMapping("/{filterCriteriaId}/values")
    public ResponseEntity<ResponseSuccess<List<FilterValueResponse>>> getFilterValuesByCriteriaId(
            @PathVariable Long filterCriteriaId,
            @RequestParam(required = false) String value
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get filter values by criteria success",
                filterCriteriaService.getFilterValuesByCriteriaId(filterCriteriaId, value)
        ));
    }

    @GetMapping("/products/{productId}/values")
    public ResponseEntity<ResponseSuccess<List<FilterValueResponse>>> getFilterValuesByProductId(
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get filter values by product success",
                filterCriteriaService.getFilterValuesByProductId(productId)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseSuccess<Void>> deleteFilterCriteria(
            @PathVariable Long id
    ) {
        filterCriteriaService.deleteFilterCriteria(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delete filter criteria successfully",
                null
        ));
    }
}

