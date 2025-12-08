package iuh.fit.ecommerce.services;


import iuh.fit.ecommerce.dtos.request.address.AddressRequest;
import iuh.fit.ecommerce.dtos.request.customer.CustomerAddRequest;
import iuh.fit.ecommerce.dtos.request.customer.CustomerProfileRequest;
import iuh.fit.ecommerce.dtos.response.address.AddressResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.customer.CustomerResponse;
import iuh.fit.ecommerce.entities.Customer;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

public interface CustomerService {
    CustomerResponse createCustomer(CustomerAddRequest customerAddRequest);
    CustomerResponse getCustomerById(long id);
    ResponseWithPagination<List<CustomerResponse>> getAllCustomers(int page, int limit,
              String name, String phone, String email, Boolean status, LocalDate startDate, LocalDate endDate, String rank);
    CustomerResponse updateCustomer(long id, CustomerProfileRequest request);
    void deleteCustomer(long id);
    void changeStatusCustomer(Long id);
    Customer getCustomerEntityById( Long id);

    void updateExpoPushToken(@NotBlank(message = "Expo push token is required") String expoPushToken);

    // Address management for admin
    AddressResponse addAddressForCustomer(Long customerId, AddressRequest request);
    AddressResponse updateAddressForCustomer(Long customerId, Long addressId, AddressRequest request);
    void deleteAddressForCustomer(Long customerId, Long addressId);

    CustomerResponse getCustomerByPhone(String phone);
}
