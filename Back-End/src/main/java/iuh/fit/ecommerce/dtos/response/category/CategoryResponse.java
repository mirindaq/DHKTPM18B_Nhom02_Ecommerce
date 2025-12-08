package iuh.fit.ecommerce.dtos.response.category;

import com.fasterxml.jackson.annotation.JsonFormat;
import iuh.fit.ecommerce.dtos.response.attribute.AttributeResponse;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String image;
    private Boolean status;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime modifiedAt;
    
    private String slug;
    private List<AttributeResponse> attributes;

}