package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.voucher.RankVoucherResponse;
import iuh.fit.ecommerce.entities.Ranking;

import java.util.List;

public interface RankingService {
    Ranking getRankingEntityById(Long id);

    List<RankVoucherResponse> getAllRankings();
}
