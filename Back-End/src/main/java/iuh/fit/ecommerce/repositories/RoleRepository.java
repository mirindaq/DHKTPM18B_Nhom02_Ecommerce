package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
}