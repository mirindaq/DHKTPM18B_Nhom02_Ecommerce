package iuh.fit.ecommerce.entities;

import iuh.fit.ecommerce.enums.DeliveryStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "delivery_assignments")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAssignment extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Column(name = "delivery_image")
    private String deliveryImage;

    @Column(name = "delivery_status")
    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @OneToMany(mappedBy = "deliveryAssignment")
    private List<DeliveryImage> deliveryImages;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "shipper_id")
    private Staff shipper;
}
