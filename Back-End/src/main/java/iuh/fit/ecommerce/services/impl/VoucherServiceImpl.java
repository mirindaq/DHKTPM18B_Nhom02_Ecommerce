package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.voucher.VoucherAddRequest;
import iuh.fit.ecommerce.dtos.request.voucher.VoucherCustomerRequest;
import iuh.fit.ecommerce.dtos.request.voucher.VoucherUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.voucher.VoucherAvailableResponse;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Ranking;
import iuh.fit.ecommerce.entities.Voucher;
import iuh.fit.ecommerce.entities.VoucherCustomer;
import iuh.fit.ecommerce.enums.VoucherCustomerStatus;
import iuh.fit.ecommerce.enums.VoucherType;
import iuh.fit.ecommerce.exceptions.custom.ConflictException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.VoucherMapper;
import iuh.fit.ecommerce.repositories.RankingRepository;
import iuh.fit.ecommerce.repositories.VoucherCustomerRepository;
import iuh.fit.ecommerce.repositories.VoucherRepository;
import iuh.fit.ecommerce.services.CustomerService;
import iuh.fit.ecommerce.services.EmailService;
import iuh.fit.ecommerce.services.RankingService;
import iuh.fit.ecommerce.services.VoucherService;
import iuh.fit.ecommerce.utils.CodeGenerator;
import iuh.fit.ecommerce.utils.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import iuh.fit.ecommerce.dtos.response.voucher.VoucherResponse;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherCustomerRepository voucherCustomerRepository;
    private final VoucherMapper voucherMapper;
    private final EmailService emailService;
    private final CustomerService customerService;
    private final RankingService rankingService;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherAddRequest request) {
        validateVoucherRequest(request);

        Voucher voucher = voucherMapper.toVoucher(request);

        if (request.getVoucherType() == VoucherType.ALL && request.getCode() != null) {
            if ( voucherRepository.existsByCode(request.getCode())) {
                throw new ConflictException("Voucher with code already exists: " + request.getCode());
            }
            voucher.setCode(request.getCode());
        }

        if (request.getVoucherType() == VoucherType.RANK && request.getRankId() != null) {
            Ranking ranking = rankingService.getRankingEntityById(request.getRankId());
            voucher.setRanking(ranking);
        }

        voucherRepository.save(voucher);

        if (request.getVoucherType() == VoucherType.GROUP && request.getVoucherCustomers() != null) {
            build(voucher, request.getVoucherCustomers());
        }

        return voucherMapper.toResponse(voucher);
    }

    @Override
    public VoucherResponse getVoucherById(Long id) {
        Voucher voucher = findById(id);
        return voucherMapper.toResponse(voucher);
    }

    @Override
    public ResponseWithPagination<List<VoucherResponse>> getAllVouchers(
            int page, int limit, String name, String type, Boolean active, LocalDate startDate, LocalDate endDate) {

        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);

        VoucherType voucherType = null;
        if (type != null && !type.isBlank()) {
            try {
                voucherType = VoucherType.valueOf(type.toUpperCase().trim());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid voucher type: " + type + ". Must be one of: ALL, GROUP, RANK");
            }
        }

        Page<Voucher> voucherPage = voucherRepository.searchVouchers(name, voucherType, active, startDate, endDate, pageable);

        return ResponseWithPagination.fromPage(voucherPage, voucherMapper::toResponse);
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(Long id, VoucherUpdateRequest request) {
        Voucher voucher = findById(id);

        voucher.setName(request.getName());
        voucher.setDescription(request.getDescription());
        voucher.setDiscount(request.getDiscount());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setActive(request.getActive());

        if (voucher.getVoucherType() == VoucherType.RANK && request.getRankId() != null) {
            Ranking ranking = rankingService.getRankingEntityById(request.getRankId());
            voucher.setRanking(ranking);
        }

        voucherRepository.save(voucher);

        if (voucher.getVoucherType() == VoucherType.GROUP && request.getVoucherCustomers() != null) {
            List<VoucherCustomer> currentTargets = voucherCustomerRepository.findAllByVoucher_Id(voucher.getId());

            List<Long> newCustomerIds = request.getVoucherCustomers().stream()
                    .map(VoucherCustomerRequest::getCustomerId)
                    .toList();

            // Xác định những khách hàng đã được phát (không còn ở trạng thái DRAFT)
            List<VoucherCustomer> issuedCustomers = currentTargets.stream()
                    .filter(vc -> vc.getVoucherCustomerStatus() != VoucherCustomerStatus.DRAFT)
                    .toList();

            // Nếu trong danh sách issued có ai bị xóa khỏi request → lỗi
            boolean hasRemovedIssued = issuedCustomers.stream()
                    .anyMatch(vc -> !newCustomerIds.contains(vc.getCustomer().getId()));

            if (hasRemovedIssued) {
                throw new ConflictException("Cannot remove customers who have already received the voucher");
            }

            // Xác định danh sách hiện tại (tất cả id đã có trong DB)
            List<Long> existingCustomerIds = currentTargets.stream()
                    .map(vc -> vc.getCustomer().getId())
                    .toList();

            // Tạo danh sách khách hàng mới (chưa có trong DB)
            List<VoucherCustomerRequest> newRequests = request.getVoucherCustomers().stream()
                    .filter(req -> !existingCustomerIds.contains(req.getCustomerId()))
                    .toList();

            if (!newRequests.isEmpty()) {
                build( voucher, newRequests);
            }
        }


        return voucherMapper.toResponse(voucher);
    }

    private void build(Voucher voucher, List<VoucherCustomerRequest> voucherCustomers) {
        List<VoucherCustomer> newTargets = voucherCustomers.stream().map(vc -> {
            Customer customer = customerService.getCustomerEntityById(vc.getCustomerId());
            return VoucherCustomer.builder()
                    .voucher(voucher)
                    .customer(customer)
                    .code(CodeGenerator.generateVoucherCode("VC" + voucher.getId()))
                    .voucherCustomerStatus(VoucherCustomerStatus.DRAFT)
                    .build();
        }).toList();
        voucherCustomerRepository.saveAll(newTargets);
        voucher.setVoucherCustomers(newTargets);
    }

    @Override
    @Transactional
    public void changeStatusVoucher(Long id) {
        Voucher voucher = findById(id);
        voucher.setActive(!voucher.getActive());
        voucherRepository.save(voucher);
    }

    @Override
    public void sendVoucherToCustomers(Long id) {
        Voucher voucher = getVoucherEntityById(id);

        if (!voucher.getActive()) {
            throw new IllegalArgumentException("Voucher is not active yet, cannot send");
        }

        List<VoucherCustomer> voucherCustomers = voucherCustomerRepository.findAllByVoucher_Id(id);

        for (VoucherCustomer vc : voucherCustomers) {
            if (vc.getVoucherCustomerStatus() == VoucherCustomerStatus.DRAFT) {
                vc.setVoucherCustomerStatus(VoucherCustomerStatus.SENT);

                emailService.sendVoucher(vc.getCustomer().getEmail(), voucher, vc.getCode());
            }
        }

        voucherCustomerRepository.saveAll(voucherCustomers);
    }

    @Override
    public Voucher getVoucherEntityById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
    }

    @Override
    public List<VoucherAvailableResponse> getAvailableVouchersForCustomer() {
        Customer customer = securityUtil.getCurrentCustomer();
        LocalDate now = LocalDate.now();

        List<VoucherAvailableResponse> customerVoucherResponses =
                voucherCustomerRepository
                        .findAllByCustomerIdAndVoucherDateBetweenAndReady(customer.getId(), now, now)
                        .stream()
                        .map(vc -> {
                            VoucherAvailableResponse dto = voucherMapper.toVoucherAvailableResponse(vc.getVoucher());
                            dto.setCode(vc.getCode());
                            return dto;
                        })
                        .toList();

        List<VoucherAvailableResponse> globalVoucherResponses =
                voucherRepository
                        .findAllByVoucherTypeAndEndDateGreaterThanEqualAndStartDateLessThanEqual(VoucherType.ALL, now, now)
                        .stream()
                        .map(voucherMapper::toVoucherAvailableResponse)
                        .toList();

        return Stream.concat(customerVoucherResponses.stream(), globalVoucherResponses.stream())
                .distinct()
                .toList();
    }

    private Voucher findById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id = " + id));
    }

    private void validateVoucherRequest(VoucherAddRequest request) {
        if (request.getVoucherType() == VoucherType.ALL) {
            if (request.getCode() == null || request.getCode().isBlank()) {
                throw new IllegalArgumentException("Voucher type 'ALL' requires a code");
            }
        } else if (request.getVoucherType() == VoucherType.GROUP) {
            if (request.getVoucherCustomers() == null || request.getVoucherCustomers().isEmpty()) {
                throw new IllegalArgumentException("Voucher type 'GROUP' requires a customer list");
            }
        } else if (request.getVoucherType() == VoucherType.RANK) {
            if (request.getRankId() == null) {
                throw new IllegalArgumentException("Voucher type 'RANK' requires a rankId");
            }
        }
    }
}
