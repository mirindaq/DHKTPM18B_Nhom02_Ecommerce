package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
}
