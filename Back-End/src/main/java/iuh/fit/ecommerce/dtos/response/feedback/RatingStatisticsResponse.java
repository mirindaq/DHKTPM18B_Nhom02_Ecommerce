package iuh.fit.ecommerce.dtos.response.feedback;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RatingStatisticsResponse {
    private Long productId;
    private Long totalReviews;
    private Double averageRating;
    private Long fiveStarCount;
    private Long fourStarCount;
    private Long threeStarCount;
    private Long twoStarCount;
    private Long oneStarCount;
}
