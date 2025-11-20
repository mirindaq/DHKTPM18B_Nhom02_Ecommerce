package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.article.ArticleAddRequest;
import iuh.fit.ecommerce.dtos.response.article.ArticleResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.entities.Article;
import iuh.fit.ecommerce.entities.ArticleCategory;
import iuh.fit.ecommerce.entities.Staff;
import iuh.fit.ecommerce.exceptions.custom.ConflictException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.ArticleMapper;
import iuh.fit.ecommerce.repositories.ArticleCategoryRepository;
import iuh.fit.ecommerce.repositories.ArticleRepository;
import iuh.fit.ecommerce.repositories.StaffRepository;
import iuh.fit.ecommerce.services.ArticleService;
import iuh.fit.ecommerce.utils.SecurityUtils;
import iuh.fit.ecommerce.utils.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
@Service
@Slf4j(topic = "ARTICLE-SERVICE")
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final ArticleCategoryRepository articleCategoryRepository;
    private final StaffRepository staffRepository;
    private final ArticleMapper articleMapper;
    private final SecurityUtils securityUtils;

    /**
     * ✅ Tạo bài viết (chỉ Staff)
     */
    @Override
    @Transactional
    public ArticleResponse createArticle(ArticleAddRequest articleAddRequest) {
        Staff staff = securityUtils.getCurrentStaff();

        // Kiểm tra trùng title
        if (articleRepository.existsByTitle(articleAddRequest.getTitle())) {
            throw new ConflictException("Article already exists with title: " + articleAddRequest.getTitle());
        }

        // Kiểm tra category hợp lệ
        ArticleCategory category = articleCategoryRepository.findById(articleAddRequest.getArticleCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Article category not found with ID: " + articleAddRequest.getArticleCategoryId()
                ));

        // Tạo slug
        String slug = StringUtils.normalizeString(articleAddRequest.getTitle());

        // Kiểm tra trùng slug
        if (articleRepository.findBySlug(slug).isPresent()) {
            throw new ConflictException("Article already exists with slug: " + slug);
        }

        // Tạo Article entity
        Article article = Article.builder()
                .title(articleAddRequest.getTitle())
                .slug(slug)
                .thumbnail(articleAddRequest.getThumbnail())
                .content(articleAddRequest.getContent())
                .status(articleAddRequest.getStatus() != null ? articleAddRequest.getStatus() : true)
                .staff(staff)
                .articleCategory(category)
                .build();

        // Lưu vào DB
        Article saved = articleRepository.save(article);
        return articleMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseWithPagination<List<ArticleResponse>> getAllArticles(
            int page, int limit, Boolean status, String title, Long categoryId, LocalDate createdDate) {

        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);
        Page<Article> articlePage = articleRepository.searchArticles(status, title, categoryId, createdDate, pageable);

        List<ArticleResponse> responses = articlePage.getContent().stream()
                .map(articleMapper::toResponse)
                .toList();

        return ResponseWithPagination.<List<ArticleResponse>>builder()
                .data(responses)
                .page(page + 1)
                .limit(limit)
                .totalItem((int) articlePage.getTotalElements())
                .totalPage(articlePage.getTotalPages())
                .build();
    }

    /**
     * ✅ Lấy bài viết theo slug
     */
    @Override
    @Transactional(readOnly = true)
    public ArticleResponse getArticleBySlug(String slug) {
        Article article = findBySlug(slug);
        return articleMapper.toResponse(article);
    }

    @Override
    @Transactional(readOnly = true)
    public ArticleResponse getArticleById(Long id) {
        Article article = findById(id);
        return articleMapper.toResponse(article);
    }


    /**
     * ✅ Cập nhật bài viết (chỉ Staff)
     */
//    @Override
//    @Transactional
//    public ArticleResponse updateArticle(String slug, ArticleAddRequest articleAddRequest) {
//        Article article = findBySlug(slug);
//        Staff staff = securityUtil.getCurrentStaff();
//
//        ArticleCategory category = articleCategoryRepository.findById(articleAddRequest.getArticleCategoryId())
//                .orElseThrow(() -> new ResourceNotFoundException(
//                        "Article category not found with ID: " + articleAddRequest.getArticleCategoryId()
//                ));
//
//        article.setTitle(articleAddRequest.getTitle());
//        article.setThumbnail(articleAddRequest.getThumbnail());
//        article.setContent(articleAddRequest.getContent());
//        article.setStatus(articleAddRequest.getStatus() != null ? articleAddRequest.getStatus() : article.getStatus());
//        article.setStaff(staff);
//        article.setArticleCategory(category);
//
//        return articleMapper.toResponse(articleRepository.save(article));
//    }

    @Override
    @Transactional
    public ArticleResponse updateArticle(Long id, ArticleAddRequest articleAddRequest) {
        Article article = findById(id);
        Staff staff = securityUtils.getCurrentStaff();

        ArticleCategory category = articleCategoryRepository.findById(articleAddRequest.getArticleCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Article category not found with ID: " + articleAddRequest.getArticleCategoryId()
                ));

        article.setTitle(articleAddRequest.getTitle());
        article.setThumbnail(articleAddRequest.getThumbnail());
        article.setContent(articleAddRequest.getContent());
        article.setStatus(articleAddRequest.getStatus() != null ? articleAddRequest.getStatus() : article.getStatus());
        article.setStaff(staff);
        article.setArticleCategory(category);

        return articleMapper.toResponse(articleRepository.save(article));
    }

    /**
     * ✅ Đổi trạng thái bài viết (chỉ Staff)
     */
//    @Override
//    @Transactional
//    public void updateArticleStatus(Long id, Boolean status) {
//        Article article = findById(id);
//        article.setStatus(status);
//        articleRepository.save(article);
//    }

    @Override
    public void changeStatusArticle(Long id) {
        Article article = findById(id);
        article.setStatus(!article.getStatus());
        articleRepository.save(article);
    }
    /**
     * 🔎 Helper methods
     */
    private Article findById(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));
    }


    private Article findBySlug(String slug) {
        return articleRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with slug: " + slug));
    }
}
