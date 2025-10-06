package iuh.fit.ecommerce.services;


import iuh.fit.ecommerce.dtos.response.role.RoleResponse;

import java.util.List;

public interface RoleService {

    List<RoleResponse> getAllRolesForAdmin();
}
