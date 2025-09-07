package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.staff.StaffAddRequest;
import iuh.fit.ecommerce.dtos.request.staff.StaffUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.staff.StaffResponse;
import iuh.fit.ecommerce.entities.Staff;
import iuh.fit.ecommerce.entities.UserRole;
import iuh.fit.ecommerce.exceptions.custom.ConflictException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.StaffMapper;
import iuh.fit.ecommerce.repositories.StaffRepository;
import iuh.fit.ecommerce.services.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final StaffMapper staffMapper;

    @Override
    @Transactional
    public StaffResponse createStaff(StaffAddRequest staffAddRequest) {
        if (staffRepository.existsByEmail(staffAddRequest.getEmail())) {
            throw new ConflictException("Email already exists");
        }
        Staff staff = new Staff();
        mapAddRequestToStaff(staffAddRequest, staff);
        for (UserRole ur : staff.getUserRole()) {
            ur.setUser(staff);
        }
        staffRepository.save(staff);

        return staffMapper.toResponse(staff);

    }

    @Override
    public ResponseWithPagination<List<StaffResponse>> getStaffs(int page, int size, String staffName) {
        page = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(page, size);
        Page<Staff> staffPage;

        if (staffName != null && !staffName.isBlank()) {
            staffPage = staffRepository.findByFullNameContainingIgnoreCase(staffName, pageable);
        } else {
            staffPage = staffRepository.findAll(pageable);
        }
        return ResponseWithPagination.fromPage(staffPage, staffMapper::toResponse);
    }

    @Override
    public StaffResponse getStaffById(Long id) {
        return staffMapper.toResponse(getStaffEntityById(id));
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
        staff.setActive(!staff.isActive());
        staffRepository.save(staff);
    }

    private Staff getStaffEntityById(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
    }


    private void mapAddRequestToStaff(StaffAddRequest staffAddRequest, Staff staff) {
        staff.setAddress(staffAddRequest.getAddress());
        staff.setAvatar(staffAddRequest.getAvatar());
        staff.setEmail(staffAddRequest.getEmail());
        staff.setFullName(staffAddRequest.getFullName());
        staff.setPassword(staffAddRequest.getPassword());
        staff.setPhone(staffAddRequest.getPhone());
        staff.setDateOfBirth(staffAddRequest.getDateOfBirth());
        staff.setActive(staffAddRequest.isActive());
        staff.setUserRole(staffAddRequest.getUserRole());
        staff.setJoinDate(staffAddRequest.getJoinDate());
        staff.setWorkStatus(staffAddRequest.getWorkStatus());
    }

    private void mapUpdateRequestToStaff(StaffUpdateRequest staffUpdateRequest, Staff staff) {
        staff.setAddress(staffUpdateRequest.getAddress());
        staff.setAvatar(staffUpdateRequest.getAvatar());
        staff.setFullName(staffUpdateRequest.getFullName());
        staff.setPhone(staffUpdateRequest.getPhone());
        staff.setDateOfBirth(staffUpdateRequest.getDateOfBirth());
        staff.setActive(staffUpdateRequest.isActive());
        staff.setJoinDate(staffUpdateRequest.getJoinDate());
        staff.setWorkStatus(staffUpdateRequest.getWorkStatus());
    }

}