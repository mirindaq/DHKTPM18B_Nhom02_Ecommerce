package iuh.fit.ecommerce.dtos.response.attribute;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttributeResponse {
        private Long id;

        private String name;

        private String categoryName;

        private boolean status;
}
