package vn.com.ecomstore.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "variants")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Variant extends BaseEntity{
    @Column
    private String name;
}
