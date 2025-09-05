package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {
}