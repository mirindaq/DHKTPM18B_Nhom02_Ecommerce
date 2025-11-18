package iuh.fit.ecommerce.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "provinces")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Province {

    @Id
    private Integer id;

    private String name;

    @Column(name = "name_slug")
    private String nameSlug;

    @Column(name = "full_name")
    private String fullName;

    private String type;


    @OneToMany(mappedBy = "province", fetch = FetchType.LAZY)
    private List<Ward> wards;
}
