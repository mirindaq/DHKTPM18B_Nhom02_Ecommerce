package iuh.fit.ecommerce.entities;

import iuh.fit.ecommerce.enums.DiscountType;
import iuh.fit.ecommerce.enums.VoucherType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "voucher_histories")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherHistory extends BaseEntity{
    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Double discountAmount;

    @ManyToOne
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

}
