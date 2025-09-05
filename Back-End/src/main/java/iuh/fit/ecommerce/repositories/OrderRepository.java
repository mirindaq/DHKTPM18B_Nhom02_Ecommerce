package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}