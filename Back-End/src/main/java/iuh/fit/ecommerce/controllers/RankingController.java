package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.rank.RankResponse;
import iuh.fit.ecommerce.dtos.response.role.RoleResponse;
import iuh.fit.ecommerce.dtos.response.voucher.RankVoucherResponse;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.services.RankingService;
import iuh.fit.ecommerce.services.RoleService;
import iuh.fit.ecommerce.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<List<RankResponse>>> getAllRank() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get rankings success",
                rankingService.getAllRankings()
        ));
    }

    @GetMapping("/my-rank")
    public ResponseEntity<ResponseSuccess<RankResponse>> getMyRank() {
        RankResponse rank = rankingService.getMyRank();
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get my rank success",
                rank
        ));
    }
}