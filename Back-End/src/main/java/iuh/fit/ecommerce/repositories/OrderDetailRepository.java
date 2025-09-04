package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
}