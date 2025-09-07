package iuh.fit.ecommerce.dtos.request.staff;

import iuh.fit.ecommerce.enums.WorkStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffUpdateRequest {

    @NotBlank(message = "Address is required")
    private String address;

    private String avatar;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone is required")
    private String phone;

    private LocalDate dateOfBirth;

    private boolean active;

    private LocalDate joinDate;

    private WorkStatus workStatus;
}

