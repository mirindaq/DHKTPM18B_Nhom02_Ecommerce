package iuh.fit.ecommerce.dtos.response.staff;

import iuh.fit.ecommerce.entities.UserRole;
import iuh.fit.ecommerce.enums.WorkStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponse {

    private Long id;

    private String address;

    private String avatar;

    private String email;

    private String fullName;

    private String password;

    private String phone;

    private LocalDate dateOfBirth;

    private boolean active;

    private List<UserRole> userRole;

    private LocalDate joinDate;

    private WorkStatus workStatus;

    private LocalDateTime createdAt;

    private LocalDateTime modifiedAt;

}
