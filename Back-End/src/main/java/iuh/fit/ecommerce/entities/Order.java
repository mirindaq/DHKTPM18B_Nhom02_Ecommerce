package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;
import iuh.fit.ecommerce.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "orders")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseEntity {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @Column( nullable = false , name = "receiver_address")
    private String receiverAddress;

    @Column( nullable = false, name = "receiver_name")
    private String receiverName;

    @Column( nullable = false, name = "receiver_phone")
    private String receiverPhone;

    @Column( name = "order_date")
    private LocalDateTime orderDate;

    @Column
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Column
    private String note;

    @Column
    private Boolean isPickup;


    // Tổng tiền gốc của đơn (chưa giảm)
    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    // Tổng giảm từ khuyến mãi
    @Column(name = "total_discount", nullable = false)
    private Double totalDiscount = 0.0;

    // Tổng tiền cuối cùng phải thanh toán = totalPrice - totalDiscount
    @Column(name = "final_total_price", nullable = false)
    private Double finalTotalPrice;

    @ManyToOne( fetch = FetchType.EAGER )
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderDetail> orderDetails;
}
