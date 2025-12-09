package iuh.fit.ecommerce.dtos.excel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffExcelDTO {
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;  // Optional
    private LocalDate joinDate;
    private Boolean isLeader;
    private String role; // STAFF, SHIPPER, or ADMIN
}
