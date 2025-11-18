package iuh.fit.ecommerce.dtos.response.ward;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WardResponse {
    private Integer id;
    private String name;
    private Integer provinceId;
}