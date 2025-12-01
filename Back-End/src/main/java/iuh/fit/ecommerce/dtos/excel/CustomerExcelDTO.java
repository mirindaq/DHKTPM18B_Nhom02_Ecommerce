package iuh.fit.ecommerce.dtos.excel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerExcelDTO {
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String note;
}
