package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, Long> {
}
