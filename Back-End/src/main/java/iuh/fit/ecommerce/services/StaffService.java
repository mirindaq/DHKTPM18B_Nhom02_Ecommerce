package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.staff.StaffAddRequest;
import iuh.fit.ecommerce.dtos.request.staff.StaffUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.staff.StaffResponse;

import java.time.LocalDate;
import java.util.List;

public interface StaffService {
    StaffResponse createStaff(StaffAddRequest staffAddRequest);

    ResponseWithPagination<List<StaffResponse>> getStaffs(
            int page,
            int size,
            String staffName,
            String email,
            String phone,
            Boolean status,
            LocalDate startDate,
            LocalDate endDate
    );

    StaffResponse getStaffById(Long id);

    StaffResponse updateStaff(StaffUpdateRequest staffUpdateRequest, Long id);

    void changeActive(Long id);
}
