package iuh.fit.ecommerce.dtos.request.banner;

import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerUpdateRequest {


    @NotBlank(message = "Title is mandatory")
    private String title;

    @NotBlank(message = "Image URL is mandatory")
    private String imageUrl;

    @NotBlank(message = "Description is mandatory")
    @Size(max = 500, message = "Description cannot be longer than 500 characters")
    private String description;

    @NotBlank(message = "Link URL is mandatory")
    @URL(message = "Invalid URL format")
    private String linkUrl;

    @NotNull(message = "isActive must be provided")
    private Boolean isActive;

    @NotNull(message = "Start date is mandatory")
    @PastOrPresent(message = "Start date must be in the past or present")
    private LocalDate startDate;

    @NotNull(message = "End date is mandatory")
    @Future(message = "End date must be in the future")
    private LocalDate endDate;
}
