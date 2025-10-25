package iuh.fit.ecommerce.dtos.response.article;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleCategoryResponse {
    private Long id;
    private String title;
    private String slug;
}