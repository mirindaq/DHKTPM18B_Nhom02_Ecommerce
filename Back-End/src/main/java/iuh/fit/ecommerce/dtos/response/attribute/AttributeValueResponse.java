package iuh.fit.ecommerce.dtos.response.attribute;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttributeValueResponse {
    private Long id;
    private String value;
    private Long attributeId;
    private String attributeName;
    private String categoryName;
    private Boolean status;
    private Integer orderIndex;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}