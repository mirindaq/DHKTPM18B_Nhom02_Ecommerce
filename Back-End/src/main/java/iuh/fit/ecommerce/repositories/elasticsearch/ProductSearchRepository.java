package iuh.fit.ecommerce.repositories.elasticsearch;

import iuh.fit.ecommerce.entities.elasticsearch.ProductDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {
    
    Page<ProductDocument> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    Page<ProductDocument> findByDescriptionContainingIgnoreCase(String description, Pageable pageable);
    
    Page<ProductDocument> findByCategorySlug(String categorySlug, Pageable pageable);
    
    Page<ProductDocument> findByBrandIdIn(List<Long> brandIds, Pageable pageable);
    
    Page<ProductDocument> findByCategoryId(Long categoryId, Pageable pageable);
}

