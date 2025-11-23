package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.FilterCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FilterCriteriaRepository extends JpaRepository<FilterCriteria, Long> {

    List<FilterCriteria> findByCategoryId(Long categoryId);

    @Query("SELECT fc FROM FilterCriteria fc " +
            "WHERE fc.category.id = :categoryId " +
            "AND (:name IS NULL OR fc.name LIKE %:name%)")
    List<FilterCriteria> findByCategoryIdAndName(
            @Param("categoryId") Long categoryId,
            @Param("name") String name
    );

    void deleteAllByCategoryId(Long categoryId);
}

