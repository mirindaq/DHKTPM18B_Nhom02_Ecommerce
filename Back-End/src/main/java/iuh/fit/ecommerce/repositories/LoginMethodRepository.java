package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.LoginMethod;

public interface LoginMethodRepository extends JpaRepository<LoginMethod, Long> {
}
