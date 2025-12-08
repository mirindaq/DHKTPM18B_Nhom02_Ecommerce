package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.configurations.CacheConfig;
import iuh.fit.ecommerce.utils.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import iuh.fit.ecommerce.dtos.request.article.ArticleCategoryAddRequest;
import iuh.fit.ecommerce.dtos.response.article.ArticleCategoryResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.entities.ArticleCategory;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.ArticleCategoryMapper;
import iuh.fit.ecommerce.repositories.ArticleCategoryRepository;
import iuh.fit.ecommerce.services.ArticleCategoryService;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleCategoryServiceImpl implements ArticleCategoryService {

    private final ArticleCategoryRepository articleCategoryRepository;
    private final ArticleCategoryMapper articleCategoryMapper;

    @Override
    @Transactional
    @CacheEvict(value = CacheConfig.ARTICLE_CATEGORY_CACHE, allEntries = true)
    public ArticleCategoryResponse createCategory(ArticleCategoryAddRequest request) {
        // Check if title already exists
        if (articleCategoryRepository.existsByTitle(request.getTitle())) {
            throw new RuntimeException("Article Category with title '" + request.getTitle() + "' already exists");
        }

        // Generate slug from title
        String slug = StringUtils.normalizeString(request.getTitle());

        // Check if slug already exists
        if (articleCategoryRepository.findBySlug(slug).isPresent()) {
            throw new RuntimeException("Article Category with slug '" + slug + "' already exists");
        }

        ArticleCategory category = articleCategoryMapper.toEntity(request);
        category.setSlug(slug);
        category.setImage(request.getImage());

        ArticleCategory savedCategory = articleCategoryRepository.save(category);
        return articleCategoryMapper.toResponse(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.ARTICLE_CATEGORY_CACHE, key = "'slug:' + #slug")
    public ArticleCategoryResponse getCategoryBySlug(String slug) {
        ArticleCategory category = articleCategoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Article Category not found with slug: " + slug));
        return articleCategoryMapper.toResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.ARTICLE_CATEGORY_CACHE, key = "#id")
    public ArticleCategoryResponse getCategoryById(Long id) {
        ArticleCategory category = articleCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article Category not found with id: " + id));
        return articleCategoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    @CacheEvict(value = CacheConfig.ARTICLE_CATEGORY_CACHE, allEntries = true)
    @CachePut(value = CacheConfig.ARTICLE_CATEGORY_CACHE, key = "#id")
    public ArticleCategoryResponse updateCategory(Long id, ArticleCategoryAddRequest request) {
        ArticleCategory category = articleCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article Category not found with id: " + id));

        // Check if new title exists (but not for this category)
        if (!category.getTitle().equals(request.getTitle()) &&
                articleCategoryRepository.existsByTitle(request.getTitle())) {
            throw new RuntimeException("Article Category with title '" + request.getTitle() + "' already exists");
        }

        category.setTitle(request.getTitle());
        category.setSlug(StringUtils.normalizeString(request.getTitle()));
        category.setImage(request.getImage());
        ArticleCategory updatedCategory = articleCategoryRepository.save(category);
        return articleCategoryMapper.toResponse(updatedCategory);
    }

    @Override
    @Transactional
    @CacheEvict(value = CacheConfig.ARTICLE_CATEGORY_CACHE, allEntries = true)
    public void deleteCategory(Long id) {
        ArticleCategory category = articleCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article Category not found with id: " + id));

        articleCategoryRepository.delete(category);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.ARTICLE_CATEGORY_CACHE, key = "'page:' + #page + ':limit:' + #limit + ':title:' + (#title != null ? #title : 'all')")
    public ResponseWithPagination<List<ArticleCategoryResponse>> getAllCategories(int page, int limit, String title) {
        page = page > 0 ? page - 1 : page;
        Pageable pageable = PageRequest.of(page, limit);

        Page<ArticleCategory> categoryPage = articleCategoryRepository.searchCategories(title, pageable);

        return ResponseWithPagination.fromPage(categoryPage, articleCategoryMapper::toResponse);
    }



}
