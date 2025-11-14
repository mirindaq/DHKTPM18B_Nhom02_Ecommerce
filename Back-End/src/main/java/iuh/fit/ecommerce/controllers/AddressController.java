package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.address.AddressRequest;
import iuh.fit.ecommerce.dtos.response.address.AddressResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.services.AddressService;
import iuh.fit.ecommerce.utils.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final SecurityUtil securityUtil;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<List<AddressResponse>>> getAddresses() {
        Customer currentCustomer = securityUtil.getCurrentCustomer();
        List<AddressResponse> addresses = addressService.getAddressesByCustomer(currentCustomer.getId());
        return ResponseEntity.ok(new ResponseSuccess<>(OK, "Get addresses success", addresses));
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<ResponseSuccess<AddressResponse>> getAddress(@PathVariable Long addressId) {
        Customer currentCustomer = securityUtil.getCurrentCustomer();
        AddressResponse address = addressService.getAddressById(currentCustomer.getId(), addressId);
        return ResponseEntity.ok(new ResponseSuccess<>(OK, "Get address success", address));
    }

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<AddressResponse>> addAddress(@Valid @RequestBody AddressRequest request) {

        System.out.println("==== Received AddressRequest ====");
        System.out.println(request);

        Customer currentCustomer = securityUtil.getCurrentCustomer();
        AddressResponse response = addressService.addAddress(currentCustomer.getId(), request);
        return ResponseEntity.status(CREATED).body(new ResponseSuccess<>(CREATED, "Add address success", response));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ResponseSuccess<AddressResponse>> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request
    ) {
        Customer currentCustomer = securityUtil.getCurrentCustomer();
        AddressResponse response = addressService.updateAddress(currentCustomer.getId(), addressId, request);
        return ResponseEntity.ok(new ResponseSuccess<>(OK, "Update address success", response));
    }

    @PatchMapping("/{addressId}/set-default")
    public ResponseEntity<ResponseSuccess<AddressResponse>> setDefaultAddress(@PathVariable Long addressId) {
        Customer currentCustomer = securityUtil.getCurrentCustomer();
        AddressResponse response = addressService.setDefaultAddress(currentCustomer.getId(), addressId);
        return ResponseEntity.ok(new ResponseSuccess<>(OK, "Set default address success", response));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<ResponseSuccess<Void>> deleteAddress(@PathVariable Long addressId) {
        Customer currentCustomer = securityUtil.getCurrentCustomer();
        addressService.deleteAddress(currentCustomer.getId(), addressId);
        return ResponseEntity.ok(new ResponseSuccess<>(OK, "Delete address success", null));
    }
}
