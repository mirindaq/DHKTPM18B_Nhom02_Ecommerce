package iuh.fit.ecommerce.dtos.response.article;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleResponse {
    private Long id;
    private String title;
    private String slug;
    private String thumbnail;
    private String content;
    private Boolean status;
    private LocalDateTime createdAt;
    private String staffName;
    private LocalDateTime modifiedAt;

    @Getter
    @Setter
    @Builder
    public static class ArticleCategoryInfo {
        private Long id;
        private String title;
        private String slug;
    }

}
