package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.staff.StaffResponse;
import iuh.fit.ecommerce.entities.Staff;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StaffMapper {
    StaffResponse toResponse(Staff staff);
}
