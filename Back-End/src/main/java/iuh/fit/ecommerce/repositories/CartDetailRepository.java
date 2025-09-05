package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.CartDetail;

public interface CartDetailRepository extends JpaRepository<CartDetail, Long> {
}
