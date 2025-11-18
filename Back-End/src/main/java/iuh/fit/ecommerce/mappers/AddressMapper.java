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

    // ========== ENTITY -> RESPONSE ==========
    @Mapping(target = "wardId", source = "ward.id")
    @Mapping(target = "wardName", source = "ward.name")

    @Mapping(target = "provinceId", source = "ward.province.id")
    @Mapping(target = "provinceName", source = "ward.province.name")

    @Mapping(target = "fullAddress", source = ".", qualifiedByName = "buildFullAddress")
    AddressResponse toResponse(Address address);


    // ========== REQUEST -> ENTITY ==========
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ward", ignore = true)        // set ở service
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "isDefault", ignore = true)
    Address toEntity(AddressRequest request);


    // ========== BUILD FULL ADDRESS ==========
    @Named("buildFullAddress")
    default String buildFullAddress(Address address) {
        if (address == null || address.getSubAddress() == null || address.getSubAddress().trim().isEmpty()) {
            return "";
        }

        String wardNameWithType = null;
        String provinceName = null;

        if (address.getWard() != null) {
            wardNameWithType = address.getWard().getNameWithType();
            if (address.getWard().getProvince() != null) {
                provinceName = address.getWard().getProvince().getName();
            }
        }

        return Stream.of(
                        address.getSubAddress(),
                        wardNameWithType,
                        provinceName
                )
                .filter(Objects::nonNull)
                .filter(s -> !s.trim().isEmpty())
                .collect(Collectors.joining(", "));
    }
}

