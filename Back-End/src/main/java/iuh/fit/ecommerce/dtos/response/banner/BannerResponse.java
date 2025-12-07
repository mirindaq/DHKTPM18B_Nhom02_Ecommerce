package iuh.fit.ecommerce.dtos.response.banner;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerResponse {

    private Long id;
    private String title;
    private String imageUrl;
    private String description;
    private String linkUrl;
    private Boolean isActive;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long staffId;
}
