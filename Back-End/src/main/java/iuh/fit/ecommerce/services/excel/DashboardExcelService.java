package iuh.fit.ecommerce.services.excel;

import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByDayResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.TopProductResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.TopVoucherResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.TopPromotionResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.entities.PromotionUsage;
import iuh.fit.ecommerce.entities.VoucherUsageHistory;
import iuh.fit.ecommerce.repositories.PromotionUsageRepository;
import iuh.fit.ecommerce.repositories.VoucherUsageHistoryRepository;
import iuh.fit.ecommerce.services.DashboardService;
import iuh.fit.ecommerce.services.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardExcelService {
    
    private final DashboardService dashboardService;
    private final ProductService productService;
    private final VoucherUsageHistoryRepository voucherUsageHistoryRepository;
    private final PromotionUsageRepository promotionUsageRepository;
    
    public byte[] exportDashboard(LocalDate startDate, LocalDate endDate) throws Exception {
        log.info("Exporting dashboard from {} to {}", startDate, endDate);
        
        Workbook workbook = new XSSFWorkbook();
        
        // Create styles
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dateStyle = createDateStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);
        
        // Sheet 1: Summary Statistics
        createSummarySheet(workbook, startDate, endDate, headerStyle, currencyStyle, numberStyle);
        
        // Sheet 2: Revenue Detail
        createRevenueSheet(workbook, startDate, endDate, headerStyle, dateStyle, currencyStyle, numberStyle);
        
        // Sheet 3: Voucher Usage
        createVoucherSheet(workbook, startDate, endDate, headerStyle, dateStyle, currencyStyle, numberStyle);
        
        // Sheet 4: Customer Promotions
        createPromotionSheet(workbook, startDate, endDate, headerStyle, dateStyle, currencyStyle, numberStyle);
        
        // Sheet 5: Products
        createProductSheet(workbook, headerStyle, currencyStyle, numberStyle);
        
        // Write to bytes
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        
        return outputStream.toByteArray();
    }
    
    private void createSummarySheet(Workbook workbook, LocalDate startDate, LocalDate endDate,
                                     CellStyle headerStyle, CellStyle currencyStyle, CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("Overall");
        
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        // Get statistics
        List<RevenueByDayResponse> revenueData = dashboardService.getRevenueByDay(startDate, endDate);
        double totalRevenue = revenueData.stream().mapToDouble(RevenueByDayResponse::getRevenue).sum();
        long totalOrders = revenueData.stream().mapToLong(RevenueByDayResponse::getOrderCount).sum();
        
        Double voucherDiscount = voucherUsageHistoryRepository.sumVoucherDiscountByDateRange(start, end);
        Double promotionDiscount = promotionUsageRepository.sumPromotionDiscountByDateRange(start, end);
        Long voucherUsageCount = voucherUsageHistoryRepository.countVoucherUsageByDateRange(start, end);
        Long promotionUsageCount = promotionUsageRepository.countPromotionUsageByDateRange(start, end);

        int rowNum = 0;
        
        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO TỔNG QUAN DASHBOARD");
        titleCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 2));
        
        rowNum++; // Empty row
        
        // Period
        Row periodRow = sheet.createRow(rowNum++);
        periodRow.createCell(0).setCellValue("Kỳ báo cáo:");
        periodRow.createCell(1).setCellValue(startDate + " đến " + endDate);

        // Export info
        Row exportTimeRow = sheet.createRow(rowNum++);
        exportTimeRow.createCell(0).setCellValue("Thời gian lập:");
        exportTimeRow.createCell(1).setCellValue(java.time.LocalDateTime.now().format(
            java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));

        Row exportByRow = sheet.createRow(rowNum++);
        exportByRow.createCell(0).setCellValue("Người lập:");
        exportByRow.createCell(1).setCellValue("Hệ thống"); // Có thể customize để lấy tên user thực tế
        
        rowNum++; // Empty row
        
        // Revenue Section
        Row revenueTitleRow = sheet.createRow(rowNum++);
        Cell revenueTitleCell = revenueTitleRow.createCell(0);
        revenueTitleCell.setCellValue("THỐNG KÊ DOANH THU");
        revenueTitleCell.setCellStyle(headerStyle);
        
        Row totalRevenueRow = sheet.createRow(rowNum++);
        totalRevenueRow.createCell(0).setCellValue("Tổng doanh thu:");
        Cell totalRevenueCell = totalRevenueRow.createCell(1);
        totalRevenueCell.setCellValue(totalRevenue);
        totalRevenueCell.setCellStyle(currencyStyle);
        
        Row totalOrdersRow = sheet.createRow(rowNum++);
        totalOrdersRow.createCell(0).setCellValue("Tổng đơn hàng:");
        Cell totalOrdersCell = totalOrdersRow.createCell(1);
        totalOrdersCell.setCellValue(totalOrders);
        totalOrdersCell.setCellStyle(numberStyle);
        
        Row avgOrderRow = sheet.createRow(rowNum++);
        avgOrderRow.createCell(0).setCellValue("Giá trị đơn hàng trung bình:");
        Cell avgOrderCell = avgOrderRow.createCell(1);
        avgOrderCell.setCellValue(totalOrders > 0 ? totalRevenue / totalOrders : 0);
        avgOrderCell.setCellStyle(currencyStyle);
        
        rowNum++; // Empty row
        
        // Discount Section
        Row discountTitleRow = sheet.createRow(rowNum++);
        Cell discountTitleCell = discountTitleRow.createCell(0);
        discountTitleCell.setCellValue("THỐNG KÊ GIẢM GIÁ");
        discountTitleCell.setCellStyle(headerStyle);
        
        Row voucherDiscountRow = sheet.createRow(rowNum++);
        voucherDiscountRow.createCell(0).setCellValue("Tổng giảm giá từ Voucher:");
        Cell voucherDiscountCell = voucherDiscountRow.createCell(1);
        voucherDiscountCell.setCellValue(voucherDiscount != null ? voucherDiscount : 0);
        voucherDiscountCell.setCellStyle(currencyStyle);
        
        Row voucherCountRow = sheet.createRow(rowNum++);
        voucherCountRow.createCell(0).setCellValue("Số lượt sử dụng Voucher:");
        Cell voucherCountCell = voucherCountRow.createCell(1);
        voucherCountCell.setCellValue(voucherUsageCount != null ? voucherUsageCount : 0);
        voucherCountCell.setCellStyle(numberStyle);
        
        Row promotionDiscountRow = sheet.createRow(rowNum++);
        promotionDiscountRow.createCell(0).setCellValue("Tổng giảm giá từ Promotion:");
        Cell promotionDiscountCell = promotionDiscountRow.createCell(1);
        promotionDiscountCell.setCellValue(promotionDiscount != null ? promotionDiscount : 0);
        promotionDiscountCell.setCellStyle(currencyStyle);
        
        Row promotionCountRow = sheet.createRow(rowNum++);
        promotionCountRow.createCell(0).setCellValue("Số lượt sử dụng Promotion:");
        Cell promotionCountCell = promotionCountRow.createCell(1);
        promotionCountCell.setCellValue(promotionUsageCount != null ? promotionUsageCount : 0);
        promotionCountCell.setCellStyle(numberStyle);
        
        Row totalDiscountRow = sheet.createRow(rowNum++);
        totalDiscountRow.createCell(0).setCellValue("Tổng giảm giá:");
        Cell totalDiscountCell = totalDiscountRow.createCell(1);
        double totalDiscount = (voucherDiscount != null ? voucherDiscount : 0) + (promotionDiscount != null ? promotionDiscount : 0);
        totalDiscountCell.setCellValue(totalDiscount);
        totalDiscountCell.setCellStyle(currencyStyle);
        
        Row netRevenueRow = sheet.createRow(rowNum++);
        netRevenueRow.createCell(0).setCellValue("Doanh thu thuần:");
        Cell netRevenueCell = netRevenueRow.createCell(1);
        netRevenueCell.setCellValue(totalRevenue - totalDiscount);
        netRevenueCell.setCellStyle(currencyStyle);
        
        // Bỏ Top Products, Top Vouchers, Top Promotions khỏi Summary sheet
        // Các thông tin này sẽ có trong các sheet riêng
        
        // Auto-size columns
        for (int i = 0; i < 3; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 2000);
        }
    }
    
    private void createRevenueSheet(Workbook workbook, LocalDate startDate, LocalDate endDate,
                                     CellStyle headerStyle, CellStyle dateStyle, 
                                     CellStyle currencyStyle, CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("Chi tiết doanh thu");
        
        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Ngày", "Tổng doanh thu", "Tổng đơn hàng", "Giá trị TB/đơn", "Tổng giảm giá", "Doanh thu thuần"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data
        List<RevenueByDayResponse> revenueData = dashboardService.getRevenueByDay(startDate, endDate);
        int rowNum = 1;
        double totalRevenue = 0;
        long totalOrders = 0;
        double totalDiscount = 0;
        
        for (RevenueByDayResponse data : revenueData) {
            Row row = sheet.createRow(rowNum++);
            
            Cell dateCell = row.createCell(0);
            if (data.getDate() != null) {
                dateCell.setCellValue(Date.from(data.getDate().atStartOfDay(ZoneId.systemDefault()).toInstant()));
                dateCell.setCellStyle(dateStyle);
            }
            
            Cell revenueCell = row.createCell(1);
            revenueCell.setCellValue(data.getRevenue());
            revenueCell.setCellStyle(currencyStyle);
            
            Cell ordersCell = row.createCell(2);
            ordersCell.setCellValue(data.getOrderCount());
            ordersCell.setCellStyle(numberStyle);
            
            // Average order value
            Cell avgCell = row.createCell(3);
            double avgValue = data.getOrderCount() > 0 ? data.getRevenue() / data.getOrderCount() : 0;
            avgCell.setCellValue(avgValue);
            avgCell.setCellStyle(currencyStyle);
            
            // Total discount (voucher + promotion)
            LocalDateTime dayStart = data.getDate().atStartOfDay();
            LocalDateTime dayEnd = data.getDate().atTime(23, 59, 59);
            Double voucherDiscount = voucherUsageHistoryRepository.sumVoucherDiscountByDateRange(dayStart, dayEnd);
            Double promotionDiscount = promotionUsageRepository.sumPromotionDiscountByDateRange(dayStart, dayEnd);
            double dayDiscount = (voucherDiscount != null ? voucherDiscount : 0) + (promotionDiscount != null ? promotionDiscount : 0);
            
            Cell discountCell = row.createCell(4);
            discountCell.setCellValue(dayDiscount);
            discountCell.setCellStyle(currencyStyle);
            
            // Net revenue (revenue - discount)
            Cell netRevenueCell = row.createCell(5);
            netRevenueCell.setCellValue(data.getRevenue() - dayDiscount);
            netRevenueCell.setCellStyle(currencyStyle);
            
            totalRevenue += data.getRevenue();
            totalOrders += data.getOrderCount();
            totalDiscount += dayDiscount;
        }
        
        // Total row
        Row totalRow = sheet.createRow(rowNum);
        Cell totalLabelCell = totalRow.createCell(0);
        totalLabelCell.setCellValue("TỔNG CỘNG");
        totalLabelCell.setCellStyle(headerStyle);
        
        Cell totalRevenueCell = totalRow.createCell(1);
        totalRevenueCell.setCellValue(totalRevenue);
        totalRevenueCell.setCellStyle(currencyStyle);
        
        Cell totalOrdersCell = totalRow.createCell(2);
        totalOrdersCell.setCellValue(totalOrders);
        totalOrdersCell.setCellStyle(numberStyle);
        
        Cell avgTotalCell = totalRow.createCell(3);
        avgTotalCell.setCellValue(totalOrders > 0 ? totalRevenue / totalOrders : 0);
        avgTotalCell.setCellStyle(currencyStyle);
        
        Cell totalDiscountCell = totalRow.createCell(4);
        totalDiscountCell.setCellValue(totalDiscount);
        totalDiscountCell.setCellStyle(currencyStyle);
        
        Cell netRevenueTotalCell = totalRow.createCell(5);
        netRevenueTotalCell.setCellValue(totalRevenue - totalDiscount);
        netRevenueTotalCell.setCellStyle(currencyStyle);
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
    }
    
    private void createVoucherSheet(Workbook workbook, LocalDate startDate, LocalDate endDate,
                                     CellStyle headerStyle, CellStyle dateStyle, 
                                     CellStyle currencyStyle, CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("Chi tiết Voucher");
        
        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Mã Voucher", "Mã đơn hàng", "Ngày đặt", "Tên khách hàng", "Số điện thoại",
                           "Code Voucher", "Tên Voucher", "Loại giảm giá", "Số tiền giảm",
                           "Tổng đơn hàng", "Thành tiền"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        List<VoucherUsageHistory> usageHistories = voucherUsageHistoryRepository
                .findAllWithDetailsByDateRange(start, end);
        
        int rowNum = 1;
        double totalDiscount = 0;
        double totalOrderValue = 0;
        double totalFinalValue = 0;
        
        for (VoucherUsageHistory usage : usageHistories) {
            Row row = sheet.createRow(rowNum++);
            
            // Voucher ID
            Cell voucherIdCell = row.createCell(0);
            voucherIdCell.setCellValue(usage.getVoucher().getId());
            voucherIdCell.setCellStyle(numberStyle);

            // Order ID
            Cell orderIdCell = row.createCell(1);
            orderIdCell.setCellValue(usage.getOrder().getId());
            orderIdCell.setCellStyle(numberStyle);
            
            // Order Date
            Cell dateCell = row.createCell(2);
            dateCell.setCellValue(Date.from(usage.getOrder().getOrderDate().atZone(ZoneId.systemDefault()).toInstant()));
            dateCell.setCellStyle(dateStyle);
            
            // Customer info
            row.createCell(3).setCellValue(usage.getOrder().getCustomer().getFullName());
            row.createCell(4).setCellValue(usage.getOrder().getCustomer().getPhone());
            
            // Voucher info
            row.createCell(5).setCellValue(usage.getVoucher().getCode());
            row.createCell(6).setCellValue(usage.getVoucher().getName());
            row.createCell(7).setCellValue(usage.getVoucher().getVoucherType().name());
            
            // Discount amount
            Cell discountCell = row.createCell(8);
            discountCell.setCellValue(usage.getDiscountAmount() != null ? usage.getDiscountAmount() : 0);
            discountCell.setCellStyle(currencyStyle);
            
            // Order total
            Cell orderTotalCell = row.createCell(9);
            orderTotalCell.setCellValue(usage.getOrder().getTotalPrice());
            orderTotalCell.setCellStyle(currencyStyle);
            
            // Final total
            Cell finalTotalCell = row.createCell(10);
            finalTotalCell.setCellValue(usage.getOrder().getFinalTotalPrice());
            finalTotalCell.setCellStyle(currencyStyle);
            
            totalDiscount += (usage.getDiscountAmount() != null ? usage.getDiscountAmount() : 0);
            totalOrderValue += usage.getOrder().getTotalPrice();
            totalFinalValue += usage.getOrder().getFinalTotalPrice();
        }
        
        // Total row
        Row totalRow = sheet.createRow(rowNum);
        Cell totalLabelCell = totalRow.createCell(0);
        totalLabelCell.setCellValue("TỔNG CỘNG");
        totalLabelCell.setCellStyle(headerStyle);
        
        Cell totalDiscountCell = totalRow.createCell(8);
        totalDiscountCell.setCellValue(totalDiscount);
        totalDiscountCell.setCellStyle(currencyStyle);
        
        Cell totalOrderCell = totalRow.createCell(9);
        totalOrderCell.setCellValue(totalOrderValue);
        totalOrderCell.setCellStyle(currencyStyle);
        
        Cell totalFinalCell = totalRow.createCell(10);
        totalFinalCell.setCellValue(totalFinalValue);
        totalFinalCell.setCellStyle(currencyStyle);
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
    }
    
    private void createPromotionSheet(Workbook workbook, LocalDate startDate, LocalDate endDate,
                                       CellStyle headerStyle, CellStyle dateStyle, 
                                       CellStyle currencyStyle, CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("Chi tiết Promotion");
        
        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Mã Promotion", "Mã khuyến mãi", "Mã đơn hàng", "Ngày đặt", "Tên khách hàng", "Số điện thoại",
                           "Tên Promotion", "Loại Promotion", "Số tiền giảm",
                           "Tổng đơn hàng", "Thành tiền", "Phương thức thanh toán", "Trạng thái"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        List<PromotionUsage> usageList = promotionUsageRepository.findAllWithDetailsByDateRange(start, end);
        
        int rowNum = 1;
        double totalDiscount = 0;
        double totalOrderValue = 0;
        double totalFinalValue = 0;
        
        for (PromotionUsage usage : usageList) {
            Row row = sheet.createRow(rowNum++);
            
            // Promotion ID
            Cell promotionIdCell = row.createCell(0);
            promotionIdCell.setCellValue(usage.getPromotion().getId());
            promotionIdCell.setCellStyle(numberStyle);

            // Promotion Code (generated from name)
            String promotionCode = generatePromotionCode(usage.getPromotion().getName());
            row.createCell(1).setCellValue(promotionCode);

            // Order ID
            Cell orderIdCell = row.createCell(2);
            orderIdCell.setCellValue(usage.getOrder().getId());
            orderIdCell.setCellStyle(numberStyle);
            
            // Order Date
            Cell dateCell = row.createCell(3);
            dateCell.setCellValue(Date.from(usage.getOrder().getOrderDate().atZone(ZoneId.systemDefault()).toInstant()));
            dateCell.setCellStyle(dateStyle);
            
            // Customer info
            row.createCell(4).setCellValue(usage.getOrder().getCustomer().getFullName());
            row.createCell(5).setCellValue(usage.getOrder().getCustomer().getPhone());
            
            // Promotion info
            row.createCell(6).setCellValue(usage.getPromotion().getName());
            row.createCell(7).setCellValue(usage.getPromotion().getPromotionType().name());
            
            // Discount amount
            Cell discountCell = row.createCell(8);
            discountCell.setCellValue(usage.getDiscountAmount() != null ? usage.getDiscountAmount() : 0);
            discountCell.setCellStyle(currencyStyle);
            
            // Order total
            Cell orderTotalCell = row.createCell(9);
            orderTotalCell.setCellValue(usage.getOrder().getTotalPrice());
            orderTotalCell.setCellStyle(currencyStyle);
            
            // Final total
            Cell finalTotalCell = row.createCell(10);
            finalTotalCell.setCellValue(usage.getOrder().getFinalTotalPrice());
            finalTotalCell.setCellStyle(currencyStyle);
            
            // Payment method
            row.createCell(11).setCellValue(usage.getOrder().getPaymentMethod() != null ?
                    usage.getOrder().getPaymentMethod().name() : "");
            
            // Status
            row.createCell(12).setCellValue(usage.getOrder().getStatus() != null ?
                    usage.getOrder().getStatus().name() : "");
            
            totalDiscount += (usage.getDiscountAmount() != null ? usage.getDiscountAmount() : 0);
            totalOrderValue += usage.getOrder().getTotalPrice();
            totalFinalValue += usage.getOrder().getFinalTotalPrice();
        }
        
        // Total row
        Row totalRow = sheet.createRow(rowNum);
        Cell totalLabelCell = totalRow.createCell(0);
        totalLabelCell.setCellValue("TỔNG CỘNG");
        totalLabelCell.setCellStyle(headerStyle);
        
        Cell totalDiscountCell = totalRow.createCell(8);
        totalDiscountCell.setCellValue(totalDiscount);
        totalDiscountCell.setCellStyle(currencyStyle);
        
        Cell totalOrderCell = totalRow.createCell(9);
        totalOrderCell.setCellValue(totalOrderValue);
        totalOrderCell.setCellStyle(currencyStyle);
        
        Cell totalFinalCell = totalRow.createCell(10);
        totalFinalCell.setCellValue(totalFinalValue);
        totalFinalCell.setCellStyle(currencyStyle);
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
    }
    
    private void createProductSheet(Workbook workbook, CellStyle headerStyle, 
                                     CellStyle currencyStyle, CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("Danh sách sản phẩm");
        
        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Mã sản phẩm", "Tên sản phẩm", "SPU", "Tồn kho", "Trạng thái"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data
        var productsResponse = productService.getAllProducts(0, Integer.MAX_VALUE, null, null, null, null, null, null);
        List<ProductResponse> products = productsResponse.getData();
        
        int rowNum = 1;
        for (ProductResponse product : products) {
            Row row = sheet.createRow(rowNum++);
            
            Cell idCell = row.createCell(0);
            idCell.setCellValue(product.getId());
            idCell.setCellStyle(numberStyle);
            
            row.createCell(1).setCellValue(product.getName() != null ? product.getName() : "");
            row.createCell(2).setCellValue(product.getSpu() != null ? product.getSpu() : "");
            
            Cell stockCell = row.createCell(3);
            stockCell.setCellValue(product.getStock() != null ? product.getStock() : 0);
            stockCell.setCellStyle(numberStyle);
            
            row.createCell(4).setCellValue(product.isStatus() ? "Hoạt động" : "Ngừng hoạt động");
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
    }
    
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
    
    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("dd/MM/yyyy"));
        return style;
    }
    
    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("#,##0 ₫"));
        return style;
    }
    
    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("#,##0"));
        return style;
    }

    /**
     * Generate promotion code from promotion name
     * Example: "Black Friday 2024" -> "BF2024"
     */
    private String generatePromotionCode(String promotionName) {
        if (promotionName == null || promotionName.isEmpty()) {
            return "PROMO";
        }

        // Remove special characters and split by space
        String[] words = promotionName.toUpperCase()
                .replaceAll("[^A-Z0-9\\s]", "")
                .split("\\s+");

        StringBuilder code = new StringBuilder();

        // Take first letter of each word (max 4 letters) + numbers
        int letterCount = 0;
        StringBuilder numbers = new StringBuilder();

        for (String word : words) {
            if (word.isEmpty()) continue;

            // Check if word is a number
            if (word.matches("\\d+")) {
                numbers.append(word);
            } else if (letterCount < 4) {
                code.append(word.charAt(0));
                letterCount++;
            }
        }

        // Append numbers at the end
        code.append(numbers);

        // If code is too short, use first 6 chars of name
        if (code.length() < 3) {
            return promotionName.toUpperCase()
                    .replaceAll("[^A-Z0-9]", "")
                    .substring(0, Math.min(6, promotionName.length()));
        }

        return code.toString();
    }
}
