package iuh.fit.ecommerce.dtos.response.customer;

import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.enums.Gender;
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
    private Gender gender;
    private LocalDate dateOfBirth;
    private List<String> roles;

    public static CustomerResponse fromCustomer(Customer customer){

        return CustomerResponse.builder()
                .id(customer.getId())
                .fullName(customer.getFullName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .avatar(customer.getAvatar())
                .active(customer.isActive())
                .registerDate(customer.getRegisterDate())
                .dateOfBirth(customer.getDateOfBirth())
                .gender(customer.getGender())
                .roles(customer.getUserRole() == null ? List.of() :
                        customer.getUserRole().stream()
                                .map(userRole -> userRole.getRole())
                                .filter(Objects::nonNull)
                                .map(role -> role.getName())
                                .toList()
                )

                .build();
    }
}
