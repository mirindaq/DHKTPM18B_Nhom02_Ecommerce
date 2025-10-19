package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "address")
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String fullName;

    @Column
    private String phone;

    @Column
    private String subAddress;

    @Column
    private Boolean isDefault;


    @ManyToOne
    @JoinColumn(name = "ward_code")
    private Ward ward;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;


    public String getFullAddress() {
        if (ward == null || ward.getProvince() == null) {
            return subAddress; // tránh lỗi NullPointerException
        }
        return subAddress + ", " + ward.getName() + ", " + ward.getProvince().getName();
    }
}
