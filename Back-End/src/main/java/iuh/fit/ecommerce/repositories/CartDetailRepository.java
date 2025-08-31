package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.CartDetail;

public interface CartDetailRepository extends JpaRepository<CartDetail, Long> {
}
