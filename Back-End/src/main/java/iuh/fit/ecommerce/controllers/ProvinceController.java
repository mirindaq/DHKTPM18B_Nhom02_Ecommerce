package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.province.ProvinceResponse;
import iuh.fit.ecommerce.dtos.response.ward.WardResponse;
import iuh.fit.ecommerce.services.ProvinceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/provinces")
@RequiredArgsConstructor
public class ProvinceController {

    private final ProvinceService provinceService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<List<ProvinceResponse>>> getAllProvinces() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all provinces success",
                provinceService.getAllProvinces()
        ));
    }

    // CHANGED: use Integer provinceId to match service signature
    @GetMapping("/{provinceId}/wards")
    public ResponseEntity<ResponseSuccess<List<WardResponse>>> getWardsByProvince(
            @PathVariable Integer provinceId
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get wards by province success",
                provinceService.getWardsByProvince(provinceId)
        ));
    }

    @GetMapping("/wards")
    public ResponseEntity<ResponseSuccess<List<WardResponse>>> getAllWards() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all wards success",
                provinceService.getAllWards()
        ));
    }

}