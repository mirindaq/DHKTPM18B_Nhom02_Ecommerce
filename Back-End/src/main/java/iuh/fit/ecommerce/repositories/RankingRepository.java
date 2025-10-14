package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Ranking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RankingRepository extends JpaRepository<Ranking, Long> {
    boolean existsByName(String name);

    Ranking findByName(String name);
}
