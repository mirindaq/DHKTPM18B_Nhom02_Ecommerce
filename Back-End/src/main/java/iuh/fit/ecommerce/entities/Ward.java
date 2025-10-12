package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "wards")
@NoArgsConstructor
@AllArgsConstructor
public class Ward {

    @Id
    private String code;
    private String name;

    @ManyToOne
    @JoinColumn(name = "province_id")
    private Province province;
}
