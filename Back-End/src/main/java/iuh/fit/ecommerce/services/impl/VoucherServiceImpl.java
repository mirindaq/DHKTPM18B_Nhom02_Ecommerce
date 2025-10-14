package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.voucher.VoucherAddRequest;
import iuh.fit.ecommerce.dtos.request.voucher.VoucherUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Ranking;
import iuh.fit.ecommerce.entities.Voucher;
import iuh.fit.ecommerce.entities.VoucherCustomer;
import iuh.fit.ecommerce.enums.VoucherCustomerStatus;
import iuh.fit.ecommerce.enums.VoucherType;
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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import iuh.fit.ecommerce.dtos.response.voucher.VoucherResponse;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherCustomerRepository voucherCustomerRepository;
    private final VoucherMapper voucherMapper;
    private final EmailService emailService;
    private final CustomerService customerService;
    private final RankingService rankingService;

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherAddRequest request) {
        validateVoucherRequest(request);

        Voucher voucher = voucherMapper.toVoucher(request);

        if (request.getVoucherType() == VoucherType.ALL && request.getCode() != null) {
            voucher.setCode(request.getCode());
        }

        if (request.getVoucherType() == VoucherType.RANK && request.getRankId() != null) {
            Ranking ranking = rankingService.getRankingEntityById(request.getRankId());
            voucher.setRanking(ranking);
        }

        voucherRepository.save(voucher);

        if (request.getVoucherType() == VoucherType.GROUP && request.getVoucherCustomers() != null) {
            List<VoucherCustomer> targets = request.getVoucherCustomers().stream().map(vc -> {
                Customer customer = customerService.getCustomerEntityById(vc.getCustomerId());

                return VoucherCustomer.builder()
                        .voucher(voucher)
                        .customer(customer)
                        .code( CodeGenerator.generateVoucherCode("VC" + voucher.getId()))
                        .voucherCustomerStatus(VoucherCustomerStatus.DRAFT)
                        .build();
            }).toList();

            voucherCustomerRepository.saveAll(targets);
            voucher.setVoucherCustomers(targets);
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
//
//        voucherMapper.updateVoucherFromDto(request, voucher);
//        voucherRepository.save(voucher);
//
//        voucherCustomerRepository.deleteByVoucher(voucher);
//        if (request.getVoucherCustomers() != null) {
//            voucherCustomerRepository.saveAll(voucherMapper.toVoucherCustomers(request.getVoucherCustomers(), voucher));
//        }

        return voucherMapper.toResponse(voucher);
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
