package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.LoginMethod;

public interface LoginMethodRepository extends JpaRepository<LoginMethod, Long> {
}
