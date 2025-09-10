package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.role.RoleResponse;
import iuh.fit.ecommerce.entities.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    RoleResponse toResponse(Role role);

}

