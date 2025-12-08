package iuh.fit.ecommerce.dtos.response.banner;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    private Long staffId;
}
