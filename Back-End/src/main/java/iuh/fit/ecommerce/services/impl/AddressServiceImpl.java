package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.address.AddressRequest;
import iuh.fit.ecommerce.dtos.response.address.AddressResponse;
import iuh.fit.ecommerce.entities.Address;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Ward;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.AddressMapper;
import iuh.fit.ecommerce.repositories.AddressRepository;
import iuh.fit.ecommerce.repositories.CustomerRepository;
import iuh.fit.ecommerce.repositories.WardRepository;
import iuh.fit.ecommerce.services.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {
    private final AddressRepository addressRepository;
    private final CustomerRepository customerRepository;
    private final AddressMapper addressMapper;
    private final WardRepository wardRepository;

    @Override
    @Transactional
    public AddressResponse addAddress(Long customerId, AddressRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Validate và lấy Ward theo wardId
        Ward ward = wardRepository.findById(request.getWardId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ward not found with id: " + request.getWardId()
                ));

        // Kiểm tra null-safe
        List<Address> existingAddresses = customer.getAddresses();
        boolean isFirstAddress = existingAddresses == null || existingAddresses.isEmpty();
        boolean shouldBeDefault = isFirstAddress || Boolean.TRUE.equals(request.getIsDefault());

        // Tạo address
        Address address = Address.builder()
                .customer(customer)
                .fullName(request.getFullName() != null && !request.getFullName().isBlank()
                        ? request.getFullName()
                        : customer.getFullName())
                .phone(request.getPhone() != null && !request.getPhone().isBlank()
                        ? request.getPhone()
                        : customer.getPhone())
                .subAddress(request.getSubAddress())
                .isDefault(false)
                .ward(ward)
                .build();

        Address saved = addressRepository.save(address);

        // Nếu phải set default
        if (shouldBeDefault) {
            addressRepository.clearDefaultAddress(customerId);
            saved.setIsDefault(true);
            saved = addressRepository.save(saved);
        }

        return addressMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long customerId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        // Kiểm tra ownership
        if (!address.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Address does not belong to this customer");
        }

        // Validate ward
        Ward ward = wardRepository.findById(request.getWardId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ward not found with id: " + request.getWardId()
                ));

        // Update dữ liệu
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setSubAddress(request.getSubAddress());
        address.setWard(ward);

        // Logic default
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            if (!Boolean.TRUE.equals(address.getIsDefault())) {
                addressRepository.clearDefaultAddress(customerId);
                address.setIsDefault(true);
            }
        } else if (Boolean.FALSE.equals(request.getIsDefault())) {
            if (Boolean.TRUE.equals(address.getIsDefault())) {
                long totalAddresses = addressRepository.countByCustomerId(customerId);
                if (totalAddresses <= 1) {
                    throw new IllegalStateException("Cannot remove default status from the only address");
                }

                address.setIsDefault(false);

                List<Address> otherAddresses = addressRepository.findByCustomerId(customerId)
                        .stream()
                        .filter(a -> !a.getId().equals(addressId))
                        .toList();

                if (!otherAddresses.isEmpty()) {
                    Address newDefault = otherAddresses.get(0);
                    newDefault.setIsDefault(true);
                    addressRepository.save(newDefault);
                }
            }
        }

        Address updated = addressRepository.save(address);
        return addressMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAddress(Long customerId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Address does not belong to this customer");
        }

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());

        addressRepository.delete(address);

        // Nếu xóa default → set cái đầu tiên còn lại làm default
        if (wasDefault) {
            List<Address> remainingAddresses = addressRepository.findByCustomerId(customerId);
            if (!remainingAddresses.isEmpty()) {
                Address firstAddress = remainingAddresses.get(0);
                firstAddress.setIsDefault(true);
                addressRepository.save(firstAddress);
            }
        }
    }

    @Override
    @Transactional
    public AddressResponse setDefaultAddress(Long customerId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Address does not belong to this customer");
        }

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            return addressMapper.toResponse(address);
        }

        addressRepository.clearDefaultAddress(customerId);
        address.setIsDefault(true);
        Address updated = addressRepository.save(address);

        return addressMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddressesByCustomer(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return addressRepository.findByCustomerIdOrderByDefaultWithDetails(customerId)
                .stream()
                .map(addressMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddressById(Long customerId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Address does not belong to this customer");
        }

        return addressMapper.toResponse(address);
    }
}
