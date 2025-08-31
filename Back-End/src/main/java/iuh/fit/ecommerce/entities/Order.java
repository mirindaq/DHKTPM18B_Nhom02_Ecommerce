package vn.com.ecomstore.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "orders")
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseEntity {

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
