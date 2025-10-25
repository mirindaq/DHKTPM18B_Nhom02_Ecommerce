package iuh.fit.ecommerce.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import iuh.fit.ecommerce.entities.ArticleCategory;
import java.util.Optional;

@Repository
public interface ArticleCategoryRepository extends JpaRepository<ArticleCategory, Long> {

    Optional<ArticleCategory> findBySlug(String slug);

    boolean existsByTitle(String title);

    @Query("SELECT ac FROM ArticleCategory ac " +
            "WHERE :title IS NULL OR LOWER(ac.title) LIKE LOWER(CONCAT('%', :title, '%')) " +
            "ORDER BY ac.createdAt DESC")
    Page<ArticleCategory> searchCategories(@Param("title") String title, Pageable pageable);
}