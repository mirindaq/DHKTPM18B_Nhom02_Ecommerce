package iuh.fit.ecommerce.entities;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

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
    private String status;

    @Column
    private String note;

    @Column( name = "total_price")
    private Double totalPrice;

    @ManyToOne( fetch = FetchType.EAGER )
    private User user;

}
