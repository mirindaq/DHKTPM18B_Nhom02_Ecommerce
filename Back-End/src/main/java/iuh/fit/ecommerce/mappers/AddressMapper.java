package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.address.AddressRequest;
import iuh.fit.ecommerce.dtos.response.address.AddressResponse;
import iuh.fit.ecommerce.entities.Address;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Mapper(componentModel = "spring")
public interface AddressMapper {

    /**
     * Map Address entity to AddressResponse DTO
     * Includes full geographical information (ward, district, province)
     */
    @Mapping(target = "wardCode", source = "ward.code")
    @Mapping(target = "wardName", source = "ward.name")


    @Mapping(target = "provinceCode", source = "ward.province.code")
    @Mapping(target = "provinceName", source = "ward.province.name")
    @Mapping(target = "fullAddress", source = ".", qualifiedByName = "buildFullAddress")
    AddressResponse toResponse(Address address);

    /**
     * Map AddressRequest to Address entity
     * Note: ward and customer must be set separately in service layer
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ward", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "isDefault", ignore = true)
    Address toEntity(AddressRequest request);

    /**
     * Build full address string in Vietnamese format
     * Format: [Số nhà, đường], [Phường/Xã], [Quận/Huyện], [Tỉnh/TP]
     *
     * Example: "123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh"
     */
    @Named("buildFullAddress")
    default String buildFullAddress(Address address) {
        if (address == null || address.getSubAddress() == null || address.getSubAddress().trim().isEmpty()) {
            return "";
        }

        String wardPart = address.getWard() != null ? address.getWard().getName() : null;
        String provincePart = address.getWard() != null && address.getWard().getProvince() != null
                ? address.getWard().getProvince().getName()
                : null;

        return Stream.of(
                        address.getSubAddress(),
                        wardPart != null ? "Phường " + wardPart : null,
                        provincePart
                )
                .filter(Objects::nonNull)
                .filter(s -> !s.trim().isEmpty())
                .collect(Collectors.joining(", "));
    }
}