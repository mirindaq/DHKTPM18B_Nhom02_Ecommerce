package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.voucher.RankVoucherResponse;
import iuh.fit.ecommerce.entities.Ranking;

import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface RankingMapper {

    RankVoucherResponse toRankVoucherResponse(Ranking ranking);
}
