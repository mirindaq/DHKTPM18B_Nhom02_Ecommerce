package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Ranking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RankingRepository extends JpaRepository<Ranking, Long> {
    boolean existsByName(String name);

    Ranking findByName(String name);

    @Query("""
        SELECT r FROM Ranking r
        WHERE :spending >= r.minSpending 
        AND (r.maxSpending IS NULL OR :spending < r.maxSpending)
        ORDER BY r.minSpending DESC
        LIMIT 1
    """)
    Optional<Ranking> findRankingBySpending(@Param("spending") Double spending);
}
