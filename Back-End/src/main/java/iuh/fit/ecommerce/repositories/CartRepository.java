package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
}
