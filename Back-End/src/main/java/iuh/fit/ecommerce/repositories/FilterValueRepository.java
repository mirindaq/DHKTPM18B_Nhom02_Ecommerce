package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.FilterValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FilterValueRepository extends JpaRepository<FilterValue, Long> {

    List<FilterValue> findByFilterCriteriaId(Long filterCriteriaId);

    @Query("SELECT fv FROM FilterValue fv " +
            "WHERE fv.filterCriteria.id = :filterCriteriaId " +
            "AND (:value IS NULL OR fv.value LIKE %:value%)")
    List<FilterValue> findByFilterCriteriaIdAndValue(
            @Param("filterCriteriaId") Long filterCriteriaId,
            @Param("value") String value
    );

    void deleteAllByFilterCriteriaId(Long filterCriteriaId);
}

