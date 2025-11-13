package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.banner.BannerAddRequest;
import iuh.fit.ecommerce.dtos.request.banner.BannerUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.banner.BannerResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.services.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("${api.prefix}/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<BannerResponse>>>> getAllBanners(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int size,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) Boolean isActive
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all banners success",
                bannerService.getAllBanners(page, size, startDate, endDate, isActive)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<BannerResponse>> getBannerById(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get banner success",
                bannerService.getBannerById(id)
        ));
    }

    @PostMapping("/add")
    public ResponseEntity<ResponseSuccess<BannerResponse>> addBanner(@RequestBody BannerAddRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Add banner success",
                bannerService.addBanner(request)
        ));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseSuccess<BannerResponse>> updateBanner(@PathVariable Long id, @RequestBody BannerUpdateRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update banner success",
                bannerService.updateBanner(id, request)
        ));
    }


    @GetMapping("/display")
    public ResponseEntity<ResponseSuccess<List<BannerResponse>>> getBannersToDisplay() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get banners to display success",
                bannerService.getBannerToDisplay()
        ));
    }
}
