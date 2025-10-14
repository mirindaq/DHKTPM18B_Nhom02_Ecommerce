package iuh.fit.ecommerce.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "provinces")
@NoArgsConstructor
@AllArgsConstructor
public class Province {

    @Id
    private String code;
    private String name;
}
