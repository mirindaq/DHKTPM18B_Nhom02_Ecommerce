package iuh.fit.ecommerce.dtos.response.shipper;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipperResponse {

    private Long id;

    private String fullName;

    private String email;

    private String phone;

    private String address;

    private String avatar;

    private boolean active;

}
