package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.customer.CustomerAddRequest;
import iuh.fit.ecommerce.dtos.request.customer.CustomerProfileRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.customer.CustomerResponse;
import iuh.fit.ecommerce.services.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @PostMapping(value = "")
    public ResponseEntity<ResponseSuccess<CustomerResponse>> createUser(@Valid @RequestBody CustomerAddRequest customerAddRequest){
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create Customer success",
                customerService.createCustomer(customerAddRequest)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<CustomerResponse>> getCustomerById(@PathVariable long id){
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Customer Profile success",
                customerService.getCustomerById(id)
        ));
    }


    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<CustomerResponse>>>> getAllCustomers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int limit,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate)
    {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Customers success",
                customerService.getAllCustomers(page, limit, name, phone, email, status, startDate, endDate)
        ));
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ResponseSuccess<CustomerResponse>> updateCustomer(@PathVariable long id,
                                                                            @Valid @RequestBody CustomerProfileRequest customerProfileRequest){
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update Customer success",
                customerService.updateCustomer(id, customerProfileRequest)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseSuccess<String>> deleteCustomer(@PathVariable long id){
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delete Customer success",
                "Deleted successfully"
        ));
    }

    @PutMapping("/change-status/{id}")
    public ResponseEntity<ResponseSuccess<Void>> changeStatusCustomer(@PathVariable Long id) {
        customerService.changeStatusCustomer(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Change status customer success",
                null
        ));
    }

}
