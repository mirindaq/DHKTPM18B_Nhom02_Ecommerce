package iuh.fit.ecommerce.dtos.request.article;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleAddRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String thumbnail;

    @NotBlank(message = "Content is required")
    private String content;


    private Boolean status;
    @NotNull(message = "Article Category ID is required")
    private Long articleCategoryId;

}
