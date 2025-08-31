package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {
}