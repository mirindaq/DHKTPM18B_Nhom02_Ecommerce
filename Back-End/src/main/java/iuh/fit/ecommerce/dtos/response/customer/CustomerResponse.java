package iuh.fit.ecommerce.dtos.response.customer;

import com.fasterxml.jackson.annotation.JsonFormat;
import iuh.fit.ecommerce.dtos.response.address.AddressResponse;
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
    private String avatar;
    private boolean active;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    private Double totalSpending;
    private String rankingName;

    private List<AddressResponse> addresses;
    private List<String> roles;
}