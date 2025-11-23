package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.shipper.ShipperResponse;
import iuh.fit.ecommerce.services.ShipperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/shippers")
@RequiredArgsConstructor
public class ShipperController {
    
    private final ShipperService shipperService;

    @GetMapping("/active")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ResponseSuccess<List<ShipperResponse>>> getAllActiveShippers() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get active shippers successfully",
                shipperService.getAllActiveShippers()
        ));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<List<ShipperResponse>>> getAllShippers() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all shippers successfully",
                shipperService.getAllShippers()
        ));
    }
}
