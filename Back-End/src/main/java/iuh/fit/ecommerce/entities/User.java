package iuh.fit.ecommerce.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "users")
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.JOINED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String address;

    @Column
    private String avatar;

    @Column(unique = true, nullable = false)
    private String email;

    @Column
    private String fullName;

    @Column
    @JsonIgnore
    private String password;

    @Column
    private String phone;

    @Column
    private LocalDate dateOfBirth;

    @Column
    private Boolean active;

    @Column
    private String refreshToken;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserRole> userRole;

    @ToString.Exclude
    @JsonIgnore
    @OneToOne(mappedBy = "user")
    private Cart cart;
}
