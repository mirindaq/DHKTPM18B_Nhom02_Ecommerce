package iuh.fit.ecommerce.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import iuh.fit.ecommerce.dtos.response.role.RoleResponse;
import iuh.fit.ecommerce.services.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/roles")
@RequiredArgsConstructor
@Tag(name = "Role Controller", description = "Controller for managing roles")
public class RoleController {

    private final RoleService roleService;

    @GetMapping("/for-admin")
    public ResponseEntity<ResponseSuccess<List<RoleResponse>>> getAllRolesForAdmin() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get roles success",
                roleService.getAllRolesForAdmin()
        ));
    }
}
