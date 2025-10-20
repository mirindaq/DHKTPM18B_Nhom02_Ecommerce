package iuh.fit.ecommerce.mappers;

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

    @Mapping(target = "wardName", source = "ward.name")
    @Mapping(target = "provinceName", source = "ward.province.name")
    @Mapping(target = "fullAddress", source = ".", qualifiedByName = "buildFullAddress")
    AddressResponse toResponse(Address address);

    @Named("buildFullAddress")
    default String buildFullAddress(Address address) {
        return Stream.of(
                        address.getSubAddress(),
                        address.getWard() != null ? address.getWard().getName() : null,
                        (address.getWard() != null && address.getWard().getProvince() != null)
                                ? address.getWard().getProvince().getName() : null
                )
                .filter(Objects::nonNull)
                .collect(Collectors.joining(", "));
    }
}
