package iuh.fit.ecommerce.dtos.request.article;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleCategoryAddRequest {

    @NotBlank(message = "Title is required")
    private String title;
}