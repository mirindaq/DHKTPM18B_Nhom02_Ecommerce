package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.customer.CustomerAddRequest;
import iuh.fit.ecommerce.dtos.request.customer.CustomerProfileRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.customer.CustomerResponse;
import iuh.fit.ecommerce.entities.Cart;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Role;
import iuh.fit.ecommerce.entities.UserRole;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.CustomerMapper;
import iuh.fit.ecommerce.repositories.CartRepository;
import iuh.fit.ecommerce.repositories.CustomerRepository;
import iuh.fit.ecommerce.repositories.RoleRepository;
import iuh.fit.ecommerce.repositories.UserRoleRepository;
import iuh.fit.ecommerce.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository userRepository;
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final UserRoleRepository userRoleRepository;
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    //tạo customer với các thuộc tính này, sau cập nhật thêm thuộc tính còn lại sau
    @Override
    @Transactional
    public CustomerResponse createCustomer(CustomerAddRequest customerAddRequest) {
        Role role = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Role CUSTOMER not exist"));

        Customer customer = Customer.builder()
                .fullName(customerAddRequest.getFullName())
                .phone(customerAddRequest.getPhone())
                .password(customerAddRequest.getPassword())
                .email(customerAddRequest.getEmail())
                .registerDate(LocalDate.now())
                .active(true)
                .build();
        userRepository.save(customer);
        UserRole userRole = UserRole.builder()
                .user(customer)
                .role(role)
                .build();
        userRoleRepository.save(userRole);
        Cart cart = Cart.builder()
                .user(customer)
                .build();
        cartRepository.save(cart);
        return CustomerResponse.builder()
                .id(customer.getId())
                .fullName(customer.getFullName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .registerDate(customer.getRegisterDate())
                .active(customer.isActive())
                .roles(Collections.singletonList(role.getName()))
                .build();
    }

    @Override
    public CustomerResponse getCustomerById(long id) {
        Customer customer = findById(id);
        return CustomerResponse.fromCustomer(customer);
    }


    @Override
    public ResponseWithPagination<List<CustomerResponse>> getAllCustomers(int page, int limit, String keyword, String status) {
        page = page > 0 ? page - 1 : page;
        Pageable pageable = PageRequest.of(page, limit);
        // Chuyển đổi status từ String ("all", "true", "false") sang Boolean (null, true, false)
        Boolean statusAsBoolean = null;
        if (status != null && !status.equalsIgnoreCase("all") && !status.isBlank()) {
            statusAsBoolean = Boolean.parseBoolean(status);
        }
        Page<Customer> customerPage = customerRepository.searchAndFilterCustomers(keyword, statusAsBoolean, pageable);
        return ResponseWithPagination.fromPage(customerPage, customerMapper::toResponse);
    }


    @Override
    @Transactional
    public CustomerResponse updateCustomer(long id, CustomerProfileRequest customerProfileRequest) {
        Customer customer = findById(id);
        customer.setFullName(customerProfileRequest.getFullName());
        customer.setPhone(customerProfileRequest.getPhone());
        customer.setEmail(customerProfileRequest.getEmail());
        customer.setGender(customerProfileRequest.getGender());
        customer.setAddress(customerProfileRequest.getAddress());
        customer.setAvatar(customerProfileRequest.getAvatar());
        customer.setDateOfBirth(customerProfileRequest.getDateOfBirth());
        userRepository.save(customer);
        return CustomerResponse.fromCustomer(customer);
    }


    public Customer findById(long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id = " + id));
    }

    @Override
    @Transactional
    public void deleteCustomer(long id) {
        Customer customer = findById(id);
        cartRepository.deleteByUser(customer);
        userRepository.delete(customer);
    }

    @Override
    public void changeActiveCustomer(Long id) {
        Customer customer = findById(id);
        customer.setActive(!customer.isActive());
        customerRepository.save(customer);
    }

//    @Override
//    public ResponseWithPagination<List<CustomerResponse>> getCustomers(int page, int size, Boolean active) {
//        page = Math.max(0, page - 1);
//        Pageable pageable = PageRequest.of(page, size);
//        Page<Customer> customerPage;
//
//        if (active != null) {
//            customerPage = customerRepository.findByActive(active, pageable);
//        } else {
//            customerPage = customerRepository.findAll(pageable);
//        }
//
//        return ResponseWithPagination.fromPage(customerPage, customerMapper::toResponse);
//    }

}
