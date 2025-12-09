package iuh.fit.ecommerce.dtos.excel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierExcelDTO {
    private String supplierName;
    private String phone;
    private String address;
    private Boolean status;
}