package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.banner.BannerAddRequest;
import iuh.fit.ecommerce.dtos.response.banner.BannerResponse;
import iuh.fit.ecommerce.entities.Banner;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BannerMapper {

    Banner toEntity(BannerAddRequest request);

    @Mapping(source = "staff.id", target = "staffId")
    BannerResponse toResponse(Banner banner);
}
