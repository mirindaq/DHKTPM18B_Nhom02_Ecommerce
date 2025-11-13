package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Banner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    // Tìm các banner đang hoạt động và có thời gian hợp lệ (startDate <= today <= endDate)
    List<Banner>  findByIsActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate startDate, LocalDate endDate);

    @Query("SELECT b FROM Banner b WHERE " +
            "(:startDate IS NULL OR b.startDate >= :startDate) " +
            "AND (:endDate IS NULL OR b.endDate <= :endDate) " +
            "AND (:isActive IS NULL OR b.isActive = :isActive)")
    Page<Banner> findByFilters(@Param("startDate") LocalDate startDate,
                               @Param("endDate") LocalDate endDate,
                               @Param("isActive") Boolean isActive,
                               Pageable pageable);

}