package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
    void deleteByUser(User user);
}
