package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.shipper.ShipperResponse;
import iuh.fit.ecommerce.entities.Staff;
import iuh.fit.ecommerce.enums.DeliveryStatus;
import iuh.fit.ecommerce.mappers.StaffMapper;
import iuh.fit.ecommerce.repositories.DeliveryAssignmentRepository;
import iuh.fit.ecommerce.repositories.RoleRepository;
import iuh.fit.ecommerce.repositories.StaffRepository;
import iuh.fit.ecommerce.services.ShipperService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipperServiceImpl implements ShipperService {

    private final StaffRepository staffRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final StaffMapper staffMapper;

    @Override
    public List<ShipperResponse> getAllActiveShippers() {
        return staffRepository.findAll().stream()
                .filter(staff -> staff.getActive() && hasShipperRole(staff))
                .filter(this::isShipperAvailable)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShipperResponse> getAllShippers() {
        return staffRepository.findAll().stream()
                .filter(this::hasShipperRole)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private boolean hasShipperRole(Staff staff) {
        return staff.getUserRoles().stream()
                .anyMatch(userRole -> "SHIPPER".equalsIgnoreCase(userRole.getRole().getName()));
    }

    private boolean isShipperAvailable(Staff staff) {
        return !deliveryAssignmentRepository.existsByShipperAndDeliveryStatus(
                staff, DeliveryStatus.DELIVERING);
    }

    private ShipperResponse mapToResponse(Staff staff) {
        return staffMapper.toShipperResponse(staff);
    }
}
