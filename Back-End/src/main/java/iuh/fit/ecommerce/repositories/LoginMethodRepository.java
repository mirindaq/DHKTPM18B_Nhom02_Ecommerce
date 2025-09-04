package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.LoginMethod;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginMethodRepository extends JpaRepository<LoginMethod, Long> {
}
