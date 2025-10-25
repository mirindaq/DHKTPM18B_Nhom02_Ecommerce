package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import iuh.fit.ecommerce.entities.ArticleCategory;

@Repository
public interface ArticleCategoryRepository extends JpaRepository<ArticleCategory, Long> {
}