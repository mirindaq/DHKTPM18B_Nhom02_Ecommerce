package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.WishList;

public interface WishListRepository extends JpaRepository<WishList, Long> {
}