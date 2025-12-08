package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Category;
import iuh.fit.ecommerce.entities.Variant;
import iuh.fit.ecommerce.entities.VariantCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VariantCategoryRepository extends JpaRepository<VariantCategory, Long> {

    void deleteAllByCategoryId(Long categoryId);

    void deleteAllByVariantId(Long variantId);

    @Query("""
    SELECT v
    FROM Variant v 
    JOIN VariantCategory vc ON vc.variant = v
    JOIN Category c ON vc.category = c
    WHERE v.status = :status 
      AND c.id = :categoryId
""")
    List<Variant> findByStatusAndCategoryId(Boolean status, Long categoryId);

    @Query("""
    SELECT v
    FROM Variant v 
    JOIN VariantCategory vc ON vc.variant = v
    JOIN Category c ON vc.category = c
    WHERE v.status = :status 
      AND c.slug = :categorySlug
""")
    List<Variant> findByStatusAndCategorySlug(Boolean status, String categorySlug);

    @Query("""
    SELECT v
    FROM Variant v 
    JOIN VariantCategory vc ON vc.variant = v
    JOIN Category c ON vc.category = c
    WHERE c.id = :categoryId
""")
    List<Variant> findVariantsByCategoryId(@Param("categoryId") Long categoryId);

    @Query("""
    SELECT c
    FROM Category c 
    JOIN VariantCategory vc ON vc.category = c
    JOIN Variant v ON vc.variant = v
    WHERE v.id = :variantId
""")
    List<Category> findCategoriesByVariantId(@Param("variantId") Long variantId);

    @Query("""
    SELECT vc
    FROM VariantCategory vc
    WHERE vc.category.id = :categoryId
""")
    List<VariantCategory> findVariantCategoriesByCategoryId(@Param("categoryId") Long categoryId);

    @Query("""
    SELECT vc
    FROM VariantCategory vc
    WHERE vc.variant.id = :variantId
""")
    List<VariantCategory> findVariantCategoriesByVariantId(@Param("variantId") Long variantId);

    Optional<VariantCategory> findByVariantIdAndCategoryId(Long variantId, Long categoryId);
}
