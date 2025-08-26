package iuh.fit.ecommerce.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "attributes")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attribute extends BaseEntity{
    @Column
    private String name;

    @ManyToOne
    private Category category;
}
