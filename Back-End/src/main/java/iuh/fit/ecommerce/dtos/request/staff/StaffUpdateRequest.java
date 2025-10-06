package iuh.fit.ecommerce.dtos.request.staff;

import iuh.fit.ecommerce.entities.UserRole;
import iuh.fit.ecommerce.enums.WorkStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class StaffUpdateRequest {

    private String address;

    private String avatar;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must have 10 digist")
    private String phone;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotNull(message = "Join date is required")
    private LocalDate joinDate;

    private WorkStatus workStatus;

    @NotNull(message = "At least one role is required")
    private List<Long> roleIds;
}

