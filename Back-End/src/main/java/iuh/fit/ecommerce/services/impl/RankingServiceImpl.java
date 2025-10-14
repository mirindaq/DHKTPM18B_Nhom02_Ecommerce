package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.entities.Ranking;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.repositories.RankingRepository;
import iuh.fit.ecommerce.services.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final RankingRepository rankingRepository;

    @Override
    public Ranking getRankingEntityById(Long id) {
        return rankingRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Ranking not found with id " + id));
    }
}
