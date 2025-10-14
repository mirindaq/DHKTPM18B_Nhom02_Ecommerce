package iuh.fit.ecommerce.entities;

import iuh.fit.ecommerce.enums.VoucherCustomerStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "voucher_customers")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherCustomer extends BaseEntity{
    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoucherCustomerStatus voucherCustomerStatus;

    @ManyToOne
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

}
