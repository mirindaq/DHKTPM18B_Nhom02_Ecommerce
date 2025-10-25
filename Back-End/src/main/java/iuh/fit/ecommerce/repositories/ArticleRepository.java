package iuh.fit.ecommerce.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import iuh.fit.ecommerce.entities.Article;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    Optional<Article> findBySlug(String slug);

    boolean existsByTitle(String title);

    @Query("SELECT a FROM Article a " +
            "WHERE (:title IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :title, '%'))) " +
            "AND (:status IS NULL OR a.status = :status) " +
            "AND (:categoryId IS NULL OR a.articleCategory.id = :categoryId) " +
            "AND (:createdDate IS NULL OR FUNCTION('DATE', a.createdAt) = :createdDate) " +
            "ORDER BY a.createdAt DESC")
    Page<Article> searchArticles(@Param("status") Boolean status,
                                 @Param("title") String title,
                                 @Param("categoryId") Long categoryId,
                                 @Param("createdDate") LocalDate createdDate,
                                 Pageable pageable);
}