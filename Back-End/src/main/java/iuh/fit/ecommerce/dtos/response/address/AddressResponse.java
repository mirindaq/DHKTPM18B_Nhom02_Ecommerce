package iuh.fit.ecommerce.dtos.response.address;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddressResponse {
    private Long id;
    private String fullName;
    private String phone;
    private String subAddress;
    private Boolean isDefault;

    private String wardName;
    private String provinceName;
    private String fullAddress;
}
