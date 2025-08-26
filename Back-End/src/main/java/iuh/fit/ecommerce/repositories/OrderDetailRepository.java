package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.OrderDetail;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
}