package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.entities.ArticleCategory;
import iuh.fit.ecommerce.repositories.ArticleCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import iuh.fit.ecommerce.dtos.request.article.ArticleAddRequest;
import iuh.fit.ecommerce.dtos.response.article.ArticleResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.entities.Article;
import iuh.fit.ecommerce.entities.Staff;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.ArticleMapper;
import iuh.fit.ecommerce.repositories.ArticleRepository;
import iuh.fit.ecommerce.services.ArticleService;
import iuh.fit.ecommerce.utils.SecurityUtil;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final ArticleMapper articleMapper;
    private final ArticleCategoryRepository articleCategoryRepository;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional
    public ArticleResponse createArticle(ArticleAddRequest articleAddRequest) {
        Staff staff = securityUtil.getCurrentStaff();

        ArticleCategory articleCategory = articleCategoryRepository.findById(articleAddRequest.getArticleCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Article Category not found with ID: " + articleAddRequest.getArticleCategoryId()));
        // Generate slug from title
        String slug = generateSlug(articleAddRequest.getTitle());

        // Check if slug already exists
        if (articleRepository.findBySlug(slug).isPresent()) {
            throw new RuntimeException("Article with slug '" + slug + "' already exists");
        }

        Article article = articleMapper.toEntity(articleAddRequest);
        article.setSlug(slug);
        article.setStaff(staff);
        article.setArticleCategory(articleCategory);
        article.setStatus(articleAddRequest.getStatus() != null ? articleAddRequest.getStatus() : true);

        Article savedArticle = articleRepository.save(article);
        return articleMapper.toResponse(savedArticle);
    }

    @Override
    @Transactional(readOnly = true)
    public ArticleResponse getArticleBySlug(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with slug: " + slug));
        return articleMapper.toResponse(article);
    }

    @Override
    @Transactional
    public ArticleResponse updateArticle(String slug, ArticleAddRequest articleAddRequest) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with slug: " + slug));

        Staff staff = securityUtil.getCurrentStaff();

        ArticleCategory articleCategory = articleCategoryRepository.findById(articleAddRequest.getArticleCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Article Category not found with ID: " + articleAddRequest.getArticleCategoryId()));


        article.setTitle(articleAddRequest.getTitle());
        article.setThumbnail(articleAddRequest.getThumbnail());
        article.setContent(articleAddRequest.getContent());
        article.setStatus(articleAddRequest.getStatus() != null ? articleAddRequest.getStatus() : article.getStatus());
        article.setStaff(staff);
        article.setArticleCategory(articleCategory);

        Article updatedArticle = articleRepository.save(article);
        return articleMapper.toResponse(updatedArticle);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseWithPagination<List<ArticleResponse>> getAllArticles(int page, int limit,
                                                                        Boolean status,
                                                                        String title,
                                                                        Long categoryId,
                                                                        LocalDate createdDate) {
        page = page > 0 ? page - 1 : page;
        Pageable pageable = PageRequest.of(page, limit);

        Page<Article> articlePage = articleRepository.searchArticles(status, title, categoryId, createdDate, pageable);

        return ResponseWithPagination.fromPage(articlePage, articleMapper::toResponse);
    }

    @Override
    @Transactional
    public void updateArticleStatus(Long id, Boolean status) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));

        article.setStatus(status);
        articleRepository.save(article);
    }

    private String generateSlug(String title) {
        return title.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

}