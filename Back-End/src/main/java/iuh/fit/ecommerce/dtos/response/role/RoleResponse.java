package iuh.fit.ecommerce.dtos.response.role;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoleResponse {
    private Long id;

    private String name;

    private String description;
}
