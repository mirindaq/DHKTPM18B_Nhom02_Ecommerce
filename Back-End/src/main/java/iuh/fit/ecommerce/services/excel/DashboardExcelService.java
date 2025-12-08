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
    
    public byte[] exportDashboard(LocalDate startDate, LocalDate endDate, String type) throws Exception {
        log.info("Exporting dashboard type '{}' from {} to {}", type, startDate, endDate);
        
        Workbook workbook = new XSSFWorkbook();
        
        // Create styles
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dateStyle = createDateStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);
        
        // Export based on type
        boolean exportAll = "all".equalsIgnoreCase(type);
        
        // Sheet 1: Summary Statistics (always include)
        createSummarySheet(workbook, startDate, endDate, headerStyle, currencyStyle, numberStyle);
        
        // Sheet 2: Revenue Detail
        if (exportAll || "revenue".equalsIgnoreCase(type)) {
            createRevenueSheet(workbook, startDate, endDate, headerStyle, dateStyle, currencyStyle, numberStyle);
        }
        
        // Sheet 3: Voucher Usage
        if (exportAll || "voucher".equalsIgnoreCase(type)) {
            createVoucherSheet(workbook, startDate, endDate, headerStyle, dateStyle, currencyStyle, numberStyle);
        }
        
        // Sheet 4: Customer Promotions
        if (exportAll || "promotion".equalsIgnoreCase(type)) {
            createPromotionSheet(workbook, startDate, endDate, headerStyle, dateStyle, currencyStyle, numberStyle);
        }
        
        // Sheet 5: Products
        if (exportAll || "product".equalsIgnoreCase(type)) {
            createProductSheet(workbook, headerStyle, currencyStyle, numberStyle);
        }
        
        // Write to bytes
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        
        return outputStream.toByteArray();
    }
    
    private void createSummarySheet(Workbook workbook, LocalDate startDate, LocalDate endDate,
                                     CellStyle headerStyle, CellStyle currencyStyle, CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("Summary Statistics");
        
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
        
        List<TopProductResponse> topProducts = dashboardService.getTopProductsByDay(startDate, endDate);
        List<TopVoucherResponse> topVouchers = dashboardService.getTopVouchersByDay(startDate, endDate);
        List<TopPromotionResponse> topPromotions = dashboardService.getTopPromotionsByDay(startDate, endDate);
        
        int rowNum = 0;
        
        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("DASHBOARD SUMMARY REPORT");
        titleCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 2));
        
        rowNum++; // Empty row
        
        // Period
        Row periodRow = sheet.createRow(rowNum++);
        periodRow.createCell(0).setCellValue("Report Period:");
        periodRow.createCell(1).setCellValue(startDate + " to " + endDate);
        
        rowNum++; // Empty row
        
        // Revenue Section
        Row revenueTitleRow = sheet.createRow(rowNum++);
        Cell revenueTitleCell = revenueTitleRow.createCell(0);
        revenueTitleCell.setCellValue("REVENUE STATISTICS");
        revenueTitleCell.setCellStyle(headerStyle);
        
        Row totalRevenueRow = sheet.createRow(rowNum++);
        totalRevenueRow.createCell(0).setCellValue("Total Revenue:");
        Cell totalRevenueCell = totalRevenueRow.createCell(1);
        totalRevenueCell.setCellValue(totalRevenue);
        totalRevenueCell.setCellStyle(currencyStyle);
        
        Row totalOrdersRow = sheet.createRow(rowNum++);
        totalOrdersRow.createCell(0).setCellValue("Total Orders:");
        Cell totalOrdersCell = totalOrdersRow.createCell(1);
        totalOrdersCell.setCellValue(totalOrders);
        totalOrdersCell.setCellStyle(numberStyle);
        
        Row avgOrderRow = sheet.createRow(rowNum++);
        avgOrderRow.createCell(0).setCellValue("Average Order Value:");
        Cell avgOrderCell = avgOrderRow.createCell(1);
        avgOrderCell.setCellValue(totalOrders > 0 ? totalRevenue / totalOrders : 0);
        avgOrderCell.setCellStyle(currencyStyle);
        
        rowNum++; // Empty row
        
        // Discount Section
        Row discountTitleRow = sheet.createRow(rowNum++);
        Cell discountTitleCell = discountTitleRow.createCell(0);
        discountTitleCell.setCellValue("DISCOUNT STATISTICS");
        discountTitleCell.setCellStyle(headerStyle);
        
        Row voucherDiscountRow = sheet.createRow(rowNum++);
        voucherDiscountRow.createCell(0).setCellValue("Total Voucher Discount:");
        Cell voucherDiscountCell = voucherDiscountRow.createCell(1);
        voucherDiscountCell.setCellValue(voucherDiscount != null ? voucherDiscount : 0);
        voucherDiscountCell.setCellStyle(currencyStyle);
        
        Row voucherCountRow = sheet.createRow(rowNum++);
        voucherCountRow.createCell(0).setCellValue("Voucher Usage Count:");
        Cell voucherCountCell = voucherCountRow.createCell(1);
        voucherCountCell.setCellValue(voucherUsageCount != null ? voucherUsageCount : 0);
        voucherCountCell.setCellStyle(numberStyle);
        
        Row promotionDiscountRow = sheet.createRow(rowNum++);
        promotionDiscountRow.createCell(0).setCellValue("Total Promotion Discount:");
        Cell promotionDiscountCell = promotionDiscountRow.createCell(1);
        promotionDiscountCell.setCellValue(promotionDiscount != null ? promotionDiscount : 0);
        promotionDiscountCell.setCellStyle(currencyStyle);
        
        Row promotionCountRow = sheet.createRow(rowNum++);
        promotionCountRow.createCell(0).setCellValue("Promotion Usage Count:");
        Cell promotionCountCell = promotionCountRow.createCell(1);
        promotionCountCell.setCellValue(promotionUsageCount != null ? promotionUsageCount : 0);
        promotionCountCell.setCellStyle(numberStyle);
        
        Row totalDiscountRow = sheet.createRow(rowNum++);
        totalDiscountRow.createCell(0).setCellValue("Total Discount:");
        Cell totalDiscountCell = totalDiscountRow.createCell(1);
        double totalDiscount = (voucherDiscount != null ? voucherDiscount : 0) + (promotionDiscount != null ? promotionDiscount : 0);
        totalDiscountCell.setCellValue(totalDiscount);
        totalDiscountCell.setCellStyle(currencyStyle);
        
        Row netRevenueRow = sheet.createRow(rowNum++);
        netRevenueRow.createCell(0).setCellValue("Net Revenue:");
        Cell netRevenueCell = netRevenueRow.createCell(1);
        netRevenueCell.setCellValue(totalRevenue - totalDiscount);
        netRevenueCell.setCellStyle(currencyStyle);
        
        rowNum++; // Empty row
        
        // Top Products
        Row topProductsTitleRow = sheet.createRow(rowNum++);
        Cell topProductsTitleCell = topProductsTitleRow.createCell(0);
        topProductsTitleCell.setCellValue("TOP 5 PRODUCTS");
        topProductsTitleCell.setCellStyle(headerStyle);
        
        Row topProductsHeaderRow = sheet.createRow(rowNum++);
        topProductsHeaderRow.createCell(0).setCellValue("Product Name");
        topProductsHeaderRow.createCell(1).setCellValue("Quantity Sold");
        topProductsHeaderRow.createCell(2).setCellValue("Revenue");
        
        for (TopProductResponse product : topProducts) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(product.getProductName());
            Cell qtyCell = row.createCell(1);
            qtyCell.setCellValue(product.getTotalQuantitySold());
            qtyCell.setCellStyle(numberStyle);
            Cell revenueCell = row.createCell(2);
            revenueCell.setCellValue(product.getTotalRevenue());
            revenueCell.setCellStyle(currencyStyle);
        }
        
        rowNum++; // Empty row
        
        // Top Vouchers
        Row topVouchersTitleRow = sheet.createRow(rowNum++);
        Cell topVouchersTitleCell = topVouchersTitleRow.createCell(0);
        topVouchersTitleCell.setCellValue("TOP 5 VOUCHERS");
        topVouchersTitleCell.setCellStyle(headerStyle);
        
        Row topVouchersHeaderRow = sheet.createRow(rowNum++);
        topVouchersHeaderRow.createCell(0).setCellValue("Voucher Code");
        topVouchersHeaderRow.createCell(1).setCellValue("Usage Count");
        topVouchersHeaderRow.createCell(2).setCellValue("Total Discount");
        
        for (TopVoucherResponse voucher : topVouchers) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(voucher.getVoucherCode());
            Cell countCell = row.createCell(1);
            countCell.setCellValue(voucher.getUsageCount());
            countCell.setCellStyle(numberStyle);
            Cell discountCell = row.createCell(2);
            discountCell.setCellValue(voucher.getTotalDiscountAmount());
            discountCell.setCellStyle(currencyStyle);
        }
        
        rowNum++; // Empty row
        
        // Top Promotions
        Row topPromotionsTitleRow = sheet.createRow(rowNum++);
        Cell topPromotionsTitleCell = topPromotionsTitleRow.createCell(0);
        topPromotionsTitleCell.setCellValue("TOP 5 PROMOTIONS");
        topPromotionsTitleCell.setCellStyle(headerStyle);
        
        Row topPromotionsHeaderRow = sheet.createRow(rowNum++);
        topPromotionsHeaderRow.createCell(0).setCellValue("Promotion Name");
        topPromotionsHeaderRow.createCell(1).setCellValue("Usage Count");
        topPromotionsHeaderRow.createCell(2).setCellValue("Total Discount");
        
        for (TopPromotionResponse promotion : topPromotions) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(promotion.getPromotionName());
            Cell countCell = row.createCell(1);
            countCell.setCellValue(promotion.getUsageCount());
            countCell.setCellStyle(numberStyle);
            Cell discountCell = row.createCell(2);
            discountCell.setCellValue(promotion.getTotalDiscountAmount());
            discountCell.setCellStyle(currencyStyle);
        }
        
        // Auto-size columns
        for (int i = 0; i < 3; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 2000);
        }
    }
    
    private void createRevenueSheet(Workbook workbook, LocalDate startDate, LocalDate endDate,
                                     CellStyle headerStyle, CellStyle dateStyle, 
                                     CellStyle currencyStyle, CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("Revenue Detail");
        
        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Date", "Total Revenue", "Total Orders", "Avg Order Value", "Total Discount", "Net Revenue"};
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
        totalLabelCell.setCellValue("TOTAL");
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
        Sheet sheet = workbook.createSheet("Voucher Usage Detail");
        
        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Order ID", "Order Date", "Customer Name", "Customer Phone", 
                           "Voucher Code", "Voucher Name", "Discount Type", "Discount Amount", 
                           "Order Total", "Final Total"};
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
            
            // Order ID
            Cell orderIdCell = row.createCell(0);
            orderIdCell.setCellValue(usage.getOrder().getId());
            orderIdCell.setCellStyle(numberStyle);
            
            // Order Date
            Cell dateCell = row.createCell(1);
            dateCell.setCellValue(Date.from(usage.getOrder().getOrderDate().atZone(ZoneId.systemDefault()).toInstant()));
            dateCell.setCellStyle(dateStyle);
            
            // Customer info
            row.createCell(2).setCellValue(usage.getOrder().getCustomer().getFullName());
            row.createCell(3).setCellValue(usage.getOrder().getCustomer().getPhone());
            
            // Voucher info
            row.createCell(4).setCellValue(usage.getVoucher().getCode());
            row.createCell(5).setCellValue(usage.getVoucher().getName());
            row.createCell(6).setCellValue(usage.getVoucher().getVoucherType().name());
            
            // Discount amount
            Cell discountCell = row.createCell(7);
            discountCell.setCellValue(usage.getDiscountAmount() != null ? usage.getDiscountAmount() : 0);
            discountCell.setCellStyle(currencyStyle);
            
            // Order total
            Cell orderTotalCell = row.createCell(8);
            orderTotalCell.setCellValue(usage.getOrder().getTotalPrice());
            orderTotalCell.setCellStyle(currencyStyle);
            
            // Final total
            Cell finalTotalCell = row.createCell(9);
            finalTotalCell.setCellValue(usage.getOrder().getFinalTotalPrice());
            finalTotalCell.setCellStyle(currencyStyle);
            
            totalDiscount += (usage.getDiscountAmount() != null ? usage.getDiscountAmount() : 0);
            totalOrderValue += usage.getOrder().getTotalPrice();
            totalFinalValue += usage.getOrder().getFinalTotalPrice();
        }
        
        // Total row
        Row totalRow = sheet.createRow(rowNum);
        Cell totalLabelCell = totalRow.createCell(0);
        totalLabelCell.setCellValue("TOTAL");
        totalLabelCell.setCellStyle(headerStyle);
        
        Cell totalDiscountCell = totalRow.createCell(7);
        totalDiscountCell.setCellValue(totalDiscount);
        totalDiscountCell.setCellStyle(currencyStyle);
        
        Cell totalOrderCell = totalRow.createCell(8);
        totalOrderCell.setCellValue(totalOrderValue);
        totalOrderCell.setCellStyle(currencyStyle);
        
        Cell totalFinalCell = totalRow.createCell(9);
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
        Sheet sheet = workbook.createSheet("Promotion Usage Detail");
        
        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Order ID", "Order Date", "Customer Name", "Customer Phone", 
                           "Promotion Name", "Promotion Type", "Discount Amount", 
                           "Order Total", "Final Total", "Payment Method", "Status"};
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
            
            // Order ID
            Cell orderIdCell = row.createCell(0);
            orderIdCell.setCellValue(usage.getOrder().getId());
            orderIdCell.setCellStyle(numberStyle);
            
            // Order Date
            Cell dateCell = row.createCell(1);
            dateCell.setCellValue(Date.from(usage.getOrder().getOrderDate().atZone(ZoneId.systemDefault()).toInstant()));
            dateCell.setCellStyle(dateStyle);
            
            // Customer info
            row.createCell(2).setCellValue(usage.getOrder().getCustomer().getFullName());
            row.createCell(3).setCellValue(usage.getOrder().getCustomer().getPhone());
            
            // Promotion info
            row.createCell(4).setCellValue(usage.getPromotion().getName());
            row.createCell(5).setCellValue(usage.getPromotion().getPromotionType().name());
            
            // Discount amount
            Cell discountCell = row.createCell(6);
            discountCell.setCellValue(usage.getDiscountAmount() != null ? usage.getDiscountAmount() : 0);
            discountCell.setCellStyle(currencyStyle);
            
            // Order total
            Cell orderTotalCell = row.createCell(7);
            orderTotalCell.setCellValue(usage.getOrder().getTotalPrice());
            orderTotalCell.setCellStyle(currencyStyle);
            
            // Final total
            Cell finalTotalCell = row.createCell(8);
            finalTotalCell.setCellValue(usage.getOrder().getFinalTotalPrice());
            finalTotalCell.setCellStyle(currencyStyle);
            
            // Payment method
            row.createCell(9).setCellValue(usage.getOrder().getPaymentMethod() != null ? 
                    usage.getOrder().getPaymentMethod().name() : "");
            
            // Status
            row.createCell(10).setCellValue(usage.getOrder().getStatus() != null ? 
                    usage.getOrder().getStatus().name() : "");
            
            totalDiscount += (usage.getDiscountAmount() != null ? usage.getDiscountAmount() : 0);
            totalOrderValue += usage.getOrder().getTotalPrice();
            totalFinalValue += usage.getOrder().getFinalTotalPrice();
        }
        
        // Total row
        Row totalRow = sheet.createRow(rowNum);
        Cell totalLabelCell = totalRow.createCell(0);
        totalLabelCell.setCellValue("TOTAL");
        totalLabelCell.setCellStyle(headerStyle);
        
        Cell totalDiscountCell = totalRow.createCell(6);
        totalDiscountCell.setCellValue(totalDiscount);
        totalDiscountCell.setCellStyle(currencyStyle);
        
        Cell totalOrderCell = totalRow.createCell(7);
        totalOrderCell.setCellValue(totalOrderValue);
        totalOrderCell.setCellStyle(currencyStyle);
        
        Cell totalFinalCell = totalRow.createCell(8);
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
        Sheet sheet = workbook.createSheet("Products");
        
        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Product ID", "Product Name", "SPU", "Stock", "Status"};
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
            
            row.createCell(4).setCellValue(product.isStatus() ? "Active" : "Inactive");
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
}
