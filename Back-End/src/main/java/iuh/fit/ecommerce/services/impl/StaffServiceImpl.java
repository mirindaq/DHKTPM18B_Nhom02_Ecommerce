package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.staff.StaffAddRequest;
import iuh.fit.ecommerce.dtos.request.staff.StaffUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.staff.StaffResponse;
import iuh.fit.ecommerce.entities.Role;
import iuh.fit.ecommerce.entities.Staff;
import iuh.fit.ecommerce.entities.UserRole;
import iuh.fit.ecommerce.exceptions.custom.ConflictException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.StaffMapper;
import iuh.fit.ecommerce.repositories.RoleRepository;
import iuh.fit.ecommerce.repositories.StaffRepository;
import iuh.fit.ecommerce.services.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final RoleRepository roleRepository;
    private final StaffRepository staffRepository;
    private final StaffMapper staffMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public StaffResponse createStaff(StaffAddRequest staffAddRequest) {
        if (staffRepository.existsByEmail(staffAddRequest.getEmail())) {
            throw new ConflictException("Email already exists");
        }
        Staff staff = mapAddRequestToStaff(staffAddRequest);

        staffRepository.save(staff);

        return staffMapper.toResponse(staff);

    }

    @Override
    @Transactional(readOnly = true)
    public ResponseWithPagination<List<StaffResponse>> getStaffs(
            int page,
            int size,
            String staffName,
            String email,
            String phone,
            Boolean status,
            LocalDate joinDate,
            Long roleId
    ) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size);

        Page<Staff> staffPage = staffRepository.findAllWithFilters(
                (staffName != null && !staffName.isBlank()) ? staffName : null,
                (email != null && !email.isBlank()) ? email : null,
                (phone != null && !phone.isBlank()) ? phone : null,
                status,
                joinDate,
                roleId,
                pageable
        );

        // Fetch userRoles for all staff in the page
        List<Staff> staffList = staffPage.getContent();
        if (!staffList.isEmpty()) {
            List<Long> staffIds = staffList.stream()
                    .map(Staff::getId)
                    .collect(Collectors.toList());
            
            List<Staff> staffsWithRoles = staffRepository.findAllWithUserRolesByIds(staffIds);
            
            // Create a map for quick lookup
            java.util.Map<Long, Staff> staffMap = staffsWithRoles.stream()
                    .collect(Collectors.toMap(Staff::getId, s -> s));
            
            // Map userRoles back to original list
            for (Staff staff : staffList) {
                Staff staffWithRoles = staffMap.get(staff.getId());
                if (staffWithRoles != null && staffWithRoles.getUserRoles() != null) {
                    staff.setUserRoles(staffWithRoles.getUserRoles());
                }
            }
        }

        return ResponseWithPagination.fromPage(staffPage, staffMapper::toResponse);
    }


    @Override
    @Transactional(readOnly = true)
    public StaffResponse getStaffById(Long id) {
        Staff staff = staffRepository.findByIdWithUserRoles(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
        return staffMapper.toResponse(staff);
    }

    @Override
    @Transactional
    public StaffResponse updateStaff(StaffUpdateRequest staffUpdateRequest, Long id) {
        Staff staff = getStaffEntityById(id);
        mapUpdateRequestToStaff(staffUpdateRequest, staff);
        staffRepository.save(staff);
        return staffMapper.toResponse(staff);
    }

    @Override
    public void changeActive(Long id) {
        Staff staff = getStaffEntityById(id);
        staff.setActive(!staff.getActive());
        staffRepository.save(staff);
    }

    @Override
    public Staff getStaffEntityById(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
    }


    private Staff mapAddRequestToStaff(StaffAddRequest staffAddRequest) {
        Staff staff = Staff.builder()
                .address(staffAddRequest.getAddress())
                .avatar(staffAddRequest.getAvatar())
                .email(staffAddRequest.getEmail())
                .fullName(staffAddRequest.getFullName())
                .password(passwordEncoder.encode(staffAddRequest.getPassword()))
                .phone(staffAddRequest.getPhone())
                .dateOfBirth(staffAddRequest.getDateOfBirth())
                .active(staffAddRequest.isActive())
                .joinDate(staffAddRequest.getJoinDate())
                .workStatus(staffAddRequest.getWorkStatus())
                .build();

        UserRole userRole = mapRoleIdToUserRole(staffAddRequest.getRoleId(), staff);
        staff.setUserRoles(new ArrayList<>());
        staff.getUserRoles().add(userRole);

        return staff;
    }

    private void mapUpdateRequestToStaff(StaffUpdateRequest staffUpdateRequest, Staff staff) {
        staff.setAddress(staffUpdateRequest.getAddress());
        staff.setAvatar(staffUpdateRequest.getAvatar());
        staff.setFullName(staffUpdateRequest.getFullName());
        staff.setPhone(staffUpdateRequest.getPhone());
        staff.setDateOfBirth(staffUpdateRequest.getDateOfBirth());
        staff.setJoinDate(staffUpdateRequest.getJoinDate());
        staff.setWorkStatus(staffUpdateRequest.getWorkStatus());

        // Map role mới nếu có
        if (staffUpdateRequest.getRoleId() != null) {
            UserRole newUserRole = mapRoleIdToUserRole(staffUpdateRequest.getRoleId(), staff);
            staff.getUserRoles().clear();
            staff.getUserRoles().add(newUserRole);
        }
    }


    private UserRole mapRoleIdToUserRole(Long roleId, Staff staff) {
        if (roleId == null) {
            throw new IllegalArgumentException("Role ID cannot be null");
        }

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));

        UserRole userRole = new UserRole();
        userRole.setRole(role);
        userRole.setUser(staff);
        return userRole;
    }

    @Override
    public List<StaffResponse> getAllActiveStaffs() {
        // Chỉ lấy Staff có role STAFF, không lấy SHIPPER
        List<Staff> activeStaffs = staffRepository.findAllActiveStaffsOnly();
        
        return activeStaffs.stream()
                .map(staffMapper::toResponse)
                .collect(Collectors.toList());
    }

}