package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Brand;
import iuh.fit.ecommerce.entities.Category;
import iuh.fit.ecommerce.entities.CategoryBrand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryBrandRepository extends JpaRepository<CategoryBrand, Long> {

    // --- Các hàm bạn đã có ---

    boolean existsByCategoryIdAndBrandId(Long categoryId, Long brandId);

    Optional<CategoryBrand> findByCategoryIdAndBrandId(Long categoryId, Long brandId);

    Optional<CategoryBrand> findByCategoryAndBrand(Category category, Brand brand);

    // --- Cần Cập Nhật/Thêm 2 hàm sau ---

    /**
     * [ĐÃ CẬP NHẬT] Lấy danh sách các Brands thuộc về một Category,
     * có lọc theo tên Brand (nếu brandName được cung cấp).
     */
    @Query("SELECT cb.brand FROM CategoryBrand cb " +
            "WHERE cb.category.id = :categoryId " +
            "AND (:brandName IS NULL OR cb.brand.name LIKE %:brandName%)")
    Page<Brand> findBrandsByCategoryIdAndName(
            @Param("categoryId") Long categoryId,
            @Param("brandName") String brandName,
            Pageable pageable
    );

    /**
     * [HÀM MỚI] Lấy danh sách các Categories chứa một Brand,
     * có lọc theo tên Category (nếu categoryName được cung cấp).
     */
    @Query("SELECT cb.category FROM CategoryBrand cb " +
            "WHERE cb.brand.id = :brandId " +
            "AND (:categoryName IS NULL OR cb.category.name LIKE %:categoryName%)")
    Page<Category> findCategoriesByBrandIdAndName(
            @Param("brandId") Long brandId,
            @Param("categoryName") String categoryName,
            Pageable pageable
    );
}