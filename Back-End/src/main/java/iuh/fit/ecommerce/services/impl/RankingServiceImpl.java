package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.rank.RankResponse;
import iuh.fit.ecommerce.dtos.response.voucher.RankVoucherResponse;
import iuh.fit.ecommerce.entities.Ranking;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.RankingMapper;
import iuh.fit.ecommerce.repositories.RankingRepository;
import iuh.fit.ecommerce.services.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final RankingRepository rankingRepository;
    private final RankingMapper rankingMapper;

    @Override
    public Ranking getRankingEntityById(Long id) {
        return rankingRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Ranking not found with id " + id));
    }

    @Override
    public List<RankResponse> getAllRankings() {
        return rankingRepository.findAll()
                .stream()
                .map(rankingMapper::toRankResponse)
                .toList();
    }

    @Override
    public Ranking getRankingForSpending(Double spending) {
        return rankingRepository.findRankingBySpending(spending)
                .orElseThrow(() -> new RuntimeException("No ranking found for spending: " + spending));
    }
}
