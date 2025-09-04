package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.WishList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishListRepository extends JpaRepository<WishList, Long> {
}