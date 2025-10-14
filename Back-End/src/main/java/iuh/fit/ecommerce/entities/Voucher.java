package iuh.fit.ecommerce.entities;

import iuh.fit.ecommerce.enums.DiscountType;
import iuh.fit.ecommerce.enums.VoucherType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "vouchers")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Voucher extends BaseEntity{
    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String code;

    @Column
    private String name;

    @Column
    private String description;

    @Column
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    @Column
    private Boolean active;

    @Column
    private Double minOrderAmount;

    @Column
    private Double maxDiscountAmount;

    @Column
    private Double discount;

    @Column
    private VoucherType voucherType;

    @ManyToOne
    @JoinColumn(name = "ranking_id")
    private Ranking ranking;

    @OneToMany( mappedBy = "voucher", fetch = FetchType.LAZY)
    private List<VoucherCustomer> voucherCustomers;

}
