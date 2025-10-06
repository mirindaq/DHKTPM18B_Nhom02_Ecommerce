package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.role.RoleResponse;
import iuh.fit.ecommerce.entities.Role;
import iuh.fit.ecommerce.mappers.RoleMapper;
import iuh.fit.ecommerce.repositories.RoleRepository;
import iuh.fit.ecommerce.services.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Override
    public List<RoleResponse> getAllRolesForAdmin() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream()
                .filter(role -> !"CUSTOMER".equalsIgnoreCase(role.getName()))
                .map(roleMapper::toResponse)
                .collect(Collectors.toList());
    }
}
