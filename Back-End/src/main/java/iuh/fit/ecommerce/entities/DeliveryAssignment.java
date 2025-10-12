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

    @Column
    private LocalDate expectedDeliveryDate;

    @Column
    private String deliveryImage;

    @Column
    private DeliveryStatus deliveryStatus;

    @Column
    private LocalDateTime deliveredAt;

    @Column
    private String note;

    @OneToMany(mappedBy = "deliveryAssignment")
    private List<DeliveryImage> deliveryImages;
}
