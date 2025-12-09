package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.role.RoleResponse;
import iuh.fit.ecommerce.dtos.response.shipper.ShipperResponse;
import iuh.fit.ecommerce.dtos.response.staff.StaffResponse;
import iuh.fit.ecommerce.entities.Role;
import iuh.fit.ecommerce.entities.Staff;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.AfterMapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public abstract class StaffMapper {

    @Autowired
    protected RoleMapper roleMapper;

    @Mapping(target = "role", ignore = true)
    public abstract StaffResponse toResponse(Staff staff);
    
    @AfterMapping
    protected void mapRole(Staff staff, @MappingTarget StaffResponse response) {
        if (staff.getUserRoles() != null && !staff.getUserRoles().isEmpty()) {
            Role role = staff.getUserRoles().get(0).getRole();
            if (role != null && roleMapper != null) {
                response.setRole(roleMapper.toResponse(role));
            }
        }
    }
    
    public abstract ShipperResponse toShipperResponse(Staff staff);
}
