package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.address.AddressRequest;
import iuh.fit.ecommerce.dtos.response.address.AddressResponse;
import iuh.fit.ecommerce.entities.Address;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Ward;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.AddressMapper;
import iuh.fit.ecommerce.mappers.CustomerMapper;
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

        Ward ward = null;
        if (request.getWardCode() != null) {
            ward = wardRepository.findById(request.getWardCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Ward not found"));
        }

        Address address = Address.builder()
                .customer(customer)
                // ✅ SỬA LỖI: Lấy tên người nhận từ REQUEST
                .fullName(request.getFullName())
                // ✅ SỬA LỖI: Lấy SĐT người nhận từ REQUEST
                .phone(customer.getPhone())
                .subAddress(request.getSubAddress())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .ward(ward)
                .build();

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.clearDefaultAddress(customerId);
        }

        Address saved = addressRepository.save(address);
        return addressMapper.toResponse(saved);
    }


    @Override
    @Transactional
    public void deleteAddress(Long customerId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Address does not belong to this customer");
        }
        addressRepository.delete(address);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long customerId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Address does not belong to this customer");
        }

        Ward ward = null;
        if (request.getWardCode() != null) {
            ward = wardRepository.findById(request.getWardCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Ward not found"));
        }

        // ✅ CẬP NHẬT TÊN VÀ SĐT: Khi cập nhật cũng phải lấy từ REQUEST
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());

        address.setSubAddress(request.getSubAddress());
        address.setWard(ward);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.clearDefaultAddress(customerId);
            address.setIsDefault(true);
        } else {
            address.setIsDefault(false);
        }

        Address updated = addressRepository.save(address);
        return addressMapper.toResponse(updated);
    }

    @Override
    public List<AddressResponse> getAddressesByCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return customer.getAddresses().stream()
                .map(addressMapper::toResponse)
                .collect(Collectors.toList());
    }

}
