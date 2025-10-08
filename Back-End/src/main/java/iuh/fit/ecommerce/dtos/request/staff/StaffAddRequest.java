package iuh.fit.ecommerce.dtos.request.staff;

import iuh.fit.ecommerce.enums.WorkStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class StaffAddRequest {

    private String address;

    private String avatar;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must have 10 digist")
    private String phone;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    private boolean active;

    @NotNull(message = "At least one role is required")
    private List<Long> roleIds;

    @NotNull(message = "Join date is required")
    private LocalDate joinDate;

    private WorkStatus workStatus;
}
