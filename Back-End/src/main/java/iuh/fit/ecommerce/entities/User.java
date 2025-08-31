package vn.com.ecomstore.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@Table(name = "users")
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity  {

    @Column
    private String address;

    @Column
    private String avatar;

    @Column
    private String email;

    @Column(name = "full_name")
    private String fullName;

    @Column
    @JsonIgnore
    private String password;

    @Column
    private String phone;

    @Column
    private boolean active;

    @Column
    private String refreshToken;

    @ManyToOne
    @JoinColumn(name = "role_id")
    @JsonIgnore
    private Role role;

    @ToString.Exclude
    @JsonIgnore
    @OneToOne(mappedBy = "user")
    private Cart cart;

}
