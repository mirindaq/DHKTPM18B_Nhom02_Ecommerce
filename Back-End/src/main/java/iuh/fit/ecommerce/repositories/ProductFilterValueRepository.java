package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.FilterValue;
import iuh.fit.ecommerce.entities.ProductFilterValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductFilterValueRepository extends JpaRepository<ProductFilterValue, Long> {

    List<ProductFilterValue> findByProductId(Long productId);

    @Query("SELECT pfv.filterValue FROM ProductFilterValue pfv " +
            "WHERE pfv.product.id = :productId")
    List<FilterValue> findFilterValuesByProductId(@Param("productId") Long productId);

    void deleteAllByProductId(Long productId);
}

