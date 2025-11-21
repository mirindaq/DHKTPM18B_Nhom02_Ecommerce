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
    private Integer id;

    private String name;

    private String slug;

    private String type;

    @Column(name = "name_with_type")
    private String nameWithType;

    private String path;

    @Column(name = "path_with_type")
    private String pathWithType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id")
    private Province province;
}