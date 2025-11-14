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

    @Builder.Default
    private Boolean isDefault = false;

    private Integer wardId;
    private String wardName;

    private Integer provinceId;
    private String provinceName;

    private String fullAddress;
}
