package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.article.ArticleAddRequest;
import iuh.fit.ecommerce.dtos.request.article.ArticleAddRequest;

import iuh.fit.ecommerce.dtos.response.article.ArticleResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.entities.Article;
import iuh.fit.ecommerce.entities.Brand;

import java.time.LocalDate;
import java.util.List;

public interface ArticleService {

    ArticleResponse createArticle(ArticleAddRequest articleRequest);

    ArticleResponse getArticleBySlug(String slug);

    ArticleResponse getArticleById(Long id);

//    ArticleResponse updateArticle(String slug, ArticleAddRequest articleAddRequest);

    ArticleResponse updateArticle(Long id, ArticleAddRequest articleAddRequest);

    ResponseWithPagination<List<ArticleResponse>> getAllArticles(int page, int limit,
                                                                 Boolean status,
                                                                 String title,
                                                                 Long categoryId,
                                                                 LocalDate createdDate);


    //    void updateArticleStatus(Long id, Boolean status);
    void changeStatusArticle(Long id);
}