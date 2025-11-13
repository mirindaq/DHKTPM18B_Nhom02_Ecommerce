package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder(toBuilder = true)
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

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @ManyToOne
    @JoinColumn(name = "ward_code")
    private Ward ward;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
}