package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductQuestionRepository  extends JpaRepository<ProductQuestion, Long> {
    Page<ProductQuestion> findByProduct(Product product, Pageable pageable);
}
