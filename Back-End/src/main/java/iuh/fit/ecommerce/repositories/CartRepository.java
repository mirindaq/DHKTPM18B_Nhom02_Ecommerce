package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Cart;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    void deleteByCustomer(Customer customer);

    Optional<Cart> findByCustomer_Id(Long customerId);
}

