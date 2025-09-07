package iuh.fit.ecommerce.dtos.request.staff;

import iuh.fit.ecommerce.entities.UserRole;
import iuh.fit.ecommerce.enums.WorkStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffAddRequest {

    @NotBlank(message = "Address is required")
    private String address;

    private String avatar;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Phone is required")
    private String phone;

    private LocalDate dateOfBirth;

    private boolean active;

    private List<UserRole> userRole;

    private LocalDate joinDate;

    private WorkStatus workStatus;
}
