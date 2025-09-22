package iuh.fit.ecommerce.dtos.response.customer;

import iuh.fit.ecommerce.entities.Customer;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomerResponse {

    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private String avatar;
    private boolean active;
    private LocalDate registerDate;
    private LocalDate dateOfBirth;
    private List<String> roles;

}
