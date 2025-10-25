package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.article.ArticleAddRequest;
import iuh.fit.ecommerce.entities.ArticleCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import iuh.fit.ecommerce.dtos.response.article.ArticleResponse;
import iuh.fit.ecommerce.entities.Article;
import iuh.fit.ecommerce.entities.Staff;

@Mapper(componentModel = "spring")
public interface ArticleMapper {


    @Mapping(source = "staff.fullName", target = "staffName")
    @Mapping(source = "articleCategory.id", target = "category.id")
    @Mapping(source = "articleCategory.title", target = "category.title")
    @Mapping(source = "articleCategory.slug", target = "category.slug")
    ArticleResponse toResponse(Article article);

    @Mapping(target = "staff", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "articleCategory", ignore = true)
    @Mapping(target = "slug", ignore = true)
    Article toEntity(ArticleAddRequest request);

    default ArticleCategory mapArticleCategoryIdToArticleCategory(Long articleCategoryId) {
        if (articleCategoryId == null) {
            return null;
        }
        ArticleCategory category = new ArticleCategory();
        category.setId(articleCategoryId);
        return category;
    }
}