package iuh.fit.ecommerce.entities;

import iuh.fit.ecommerce.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "customers")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Customer extends User {

    @Column(name = "register_date")
    private LocalDate registerDate; // Ngày đăng ký tài khoản

    @Column
    @Enumerated(EnumType.STRING)
    private Gender gender;



}
