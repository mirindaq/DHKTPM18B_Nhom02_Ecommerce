package iuh.fit.ecommerce.entities;

import iuh.fit.ecommerce.enums.WorkStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "staffs")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Staff extends User {

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(name = "work_status")
    @Enumerated(EnumType.STRING)
    private WorkStatus workStatus;

    @Column
    private Boolean leader;

    @Column
    private String address;

}
