package iuh.fit.ecommerce.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import iuh.fit.ecommerce.dtos.request.article.ArticleCategoryAddRequest;
import iuh.fit.ecommerce.dtos.response.article.ArticleCategoryResponse;
import iuh.fit.ecommerce.entities.ArticleCategory;

@Mapper(componentModel = "spring")
public interface ArticleCategoryMapper {

    ArticleCategoryResponse toResponse(ArticleCategory articleCategory);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    ArticleCategory toEntity(ArticleCategoryAddRequest request);
}