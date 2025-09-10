package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Role;
import iuh.fit.ecommerce.entities.User;
import iuh.fit.ecommerce.entities.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    boolean existsByRole(Role role);
    void deleteByUser(User user);

}
