package vn.com.ecomstore.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "brands")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Brand extends BaseEntity{
    
    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String description;

    @Column
    private String image;

    @Column
    private String origin;

    @Column
    private boolean status;

}
