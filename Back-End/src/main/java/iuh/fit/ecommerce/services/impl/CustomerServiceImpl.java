package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.customer.CustomerAddRequest;
import iuh.fit.ecommerce.dtos.request.customer.CustomerProfileRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.customer.CustomerResponse;
import iuh.fit.ecommerce.entities.*;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.CustomerMapper;
import iuh.fit.ecommerce.repositories.*;
import iuh.fit.ecommerce.services.CustomerService;
import iuh.fit.ecommerce.services.RankingService;
import iuh.fit.ecommerce.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final UserRoleRepository userRoleRepository;
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final PasswordEncoder passwordEncoder;
    private final RankingService rankingService;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public CustomerResponse createCustomer(CustomerAddRequest request) {
        Role role = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Role CUSTOMER not exist"));
        Customer customer = customerMapper.toCustomer(request);
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        customer.setActive(true);
        if (customer.getAddresses() != null && !customer.getAddresses().isEmpty()) {
            for (Address address : customer.getAddresses()) {
                address.setCustomer(customer);
            }
        }
        customerRepository.save(customer);
        UserRole userRole = UserRole.builder()
                .user(customer)
                .role(role)
                .build();
        userRoleRepository.save(userRole);
        Cart cart = Cart.builder()
                .customer(customer)
                .build();
        cartRepository.save(cart);

        Double newTotal = customer.getTotalSpending();
        customer.setTotalSpending(newTotal);

        Ranking newRank = rankingService.getRankingForSpending(newTotal);
        customer.setRanking(newRank);
        return customerMapper.toResponse(customer, role.getName());
    }

    @Override
    public CustomerResponse getCustomerById(long id) {
        Customer customer = getCustomerEntityById(id);
        return customerMapper.toResponse(customer);
    }


    @Override
    @Transactional
    public ResponseWithPagination<List<CustomerResponse>> getAllCustomers(int page, int limit, String name,
             String phone, String email, Boolean status, LocalDate startDate, LocalDate endDate, String rank ) {
        page = page > 0 ? page - 1 : page;
        Pageable pageable = PageRequest.of(page, limit);

        Page<Customer> customerPage = customerRepository.searchCustomers(name, phone, email, status, startDate, endDate,rank, pageable);
        return ResponseWithPagination.fromPage(customerPage, customerMapper::toResponse);
    }


    @Override
    @Transactional
    public CustomerResponse updateCustomer(long id, CustomerProfileRequest customerProfileRequest) {
        Customer customer = getCustomerEntityById(id);
        customer.setFullName(customerProfileRequest.getFullName());
        customer.setPhone(customerProfileRequest.getPhone());
        customer.setEmail(customerProfileRequest.getEmail());
        customer.setAvatar(customerProfileRequest.getAvatar());
        customer.setDateOfBirth(customerProfileRequest.getDateOfBirth());
        customerRepository.save(customer);
        return customerMapper.toResponse(customer);
    }

    @Override
    @Transactional
    public void deleteCustomer(long id) {
        Customer customer = getCustomerEntityById(id);
        cartRepository.deleteByCustomer(customer);
        customerRepository.delete(customer);
    }

    @Override
    @Transactional
    public void changeStatusCustomer(Long id) {
        Customer customer = getCustomerEntityById(id);
        Boolean currentStatus = customer.getActive();
        Boolean newStatus = (currentStatus == null) ? Boolean.TRUE : !currentStatus;
        customer.setActive(newStatus);
        customerRepository.save(customer);
    }

    @Override
    public Customer getCustomerEntityById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id = " + id));
    }

    @Override
    @Transactional
    public void updateExpoPushToken(String expoPushToken) {
        Customer customer = securityUtils.getCurrentCustomer();
        customer.setExpoPushToken(expoPushToken);
        customerRepository.save(customer);
    }

}