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

    private String wardCode;
    private String wardName;



    // Province information
    private String provinceCode;
    private String provinceName;

    // Full formatted address
    // Example: "123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh"
    private String fullAddress;
}