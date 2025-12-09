package iuh.fit.ecommerce.dtos.response.staff;

import com.fasterxml.jackson.annotation.JsonFormat;
import iuh.fit.ecommerce.dtos.response.role.RoleResponse;
import iuh.fit.ecommerce.enums.WorkStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    private String phone;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    private boolean active;

    private RoleResponse role;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate joinDate;

    private WorkStatus workStatus;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime modifiedAt;

}
