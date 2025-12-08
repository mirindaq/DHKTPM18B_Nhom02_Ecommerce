package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.configurations.CacheConfig;
import iuh.fit.ecommerce.dtos.response.rank.RankResponse;
import iuh.fit.ecommerce.dtos.response.voucher.RankVoucherResponse;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.entities.Ranking;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.RankingMapper;
import iuh.fit.ecommerce.repositories.CustomerRepository;
import iuh.fit.ecommerce.repositories.RankingRepository;
import iuh.fit.ecommerce.services.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final RankingRepository rankingRepository;
    private final RankingMapper rankingMapper;
    private final CustomerRepository customerRepository;

    @Override
    public Ranking getRankingEntityById(Long id) {
        return rankingRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Ranking not found with id " + id));
    }

    @Override
    @Cacheable(value = CacheConfig.RANKING_CACHE, key = "'all'")
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

    @Override
    @Transactional
    public void updateCustomerRanking(Order order) {
        Customer customer = order.getCustomer();
        if (customer == null) {
            return;
        }

        Double currentSpending = customer.getTotalSpending();
        Double orderAmount = order.getFinalTotalPrice();
        
        if (orderAmount == null || orderAmount <= 0) {
            return;
        }

        Double newTotalSpending = (currentSpending == null ? 0.0 : currentSpending) + orderAmount;
        customer.setTotalSpending(newTotalSpending);

        Ranking newRank = getRankingForSpending(newTotalSpending);
        customer.setRanking(newRank);

        customerRepository.save(customer);
    }
}
