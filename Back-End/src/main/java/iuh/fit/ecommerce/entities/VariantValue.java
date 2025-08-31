package vn.com.ecomstore.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "variant_value")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantValue extends BaseEntity{

    @Column
    private String value;

    @Column
    private String image;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    private Variant variant;


}
