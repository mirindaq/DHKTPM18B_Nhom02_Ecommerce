package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.address.AddressRequest;
import iuh.fit.ecommerce.dtos.response.address.AddressResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.services.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/customers/{customerId}/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<List<AddressResponse>>> getAddresses(
            @PathVariable Long customerId
    ) {
        List<AddressResponse> addresses = addressService.getAddressesByCustomer(customerId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get addresses success",
                addresses
        ));
    }

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<AddressResponse>> addAddress(
            @PathVariable Long customerId,
            @Valid @RequestBody AddressRequest request
    ) {
        AddressResponse response = addressService.addAddress(customerId, request);
        return ResponseEntity.status(CREATED).body(new ResponseSuccess<>(
                CREATED,
                "Add address success",
                response
        ));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ResponseSuccess<AddressResponse>> updateAddress(
            @PathVariable Long customerId,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request
    ) {
        AddressResponse response = addressService.updateAddress(customerId, addressId, request);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update address success",
                response
        ));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<ResponseSuccess<Void>> deleteAddress(
            @PathVariable Long customerId,
            @PathVariable Long addressId
    ) {
        addressService.deleteAddress(customerId, addressId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delete address success",
                null
        ));
    }
}
