package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.rank.RankResponse;

import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Ranking;

import java.util.List;

public interface RankingService {
    Ranking getRankingEntityById(Long id);

    Ranking getRankingForSpending(Double spending);
    List<RankResponse> getAllRankings();
    
    void updateCustomerRanking(Order order);
    
    RankResponse getMyRank();
}
