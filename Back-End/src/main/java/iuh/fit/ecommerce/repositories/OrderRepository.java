package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}