package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Promotion;
import iuh.fit.ecommerce.entities.PromotionTarget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionTargetRepository extends JpaRepository<PromotionTarget, Long> {
    void deleteByPromotion(Promotion promotion);
}
