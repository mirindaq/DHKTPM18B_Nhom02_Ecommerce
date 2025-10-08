package iuh.fit.ecommerce.dtos.request.customer;

import iuh.fit.ecommerce.entities.Cart;
import iuh.fit.ecommerce.entities.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class CustomerAddRequest {

    @NotBlank(message = "Full name is required")

    private String fullName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must have 10 digist")
    private String phone;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String avatar;

    private String address;

    private LocalDate dateOfBirth;

    private LocalDate registerDate;

    private List<UserRole> userRole;
    private Cart cart;
}
