-- =====================================================
-- KIỂM TRA DỮ LIỆU VOUCHER
-- =====================================================

-- 1. Kiểm tra có vouchers không
SELECT 'Vouchers:' as check_type;
SELECT * FROM vouchers WHERE code IN ('SUMMER2024', 'FREESHIP50', 'STUDENT20', 'BLACKFRIDAY', 'VIP100');

-- 2. Kiểm tra có voucher_usage_histories không
SELECT 'Voucher Usage Histories:' as check_type;
SELECT * FROM voucher_usage_histories LIMIT 10;

-- 3. Kiểm tra số lượng usage theo voucher
SELECT 'Usage Count by Voucher:' as check_type;
SELECT 
    v.id,
    v.code,
    v.name,
    COUNT(vuh.id) as usage_count,
    SUM(vuh.discount_amount) as total_discount
FROM vouchers v
LEFT JOIN voucher_usage_histories vuh ON v.id = vuh.voucher_id
WHERE v.code IN ('SUMMER2024', 'FREESHIP50', 'STUDENT20', 'BLACKFRIDAY', 'VIP100')
GROUP BY v.id, v.code, v.name
ORDER BY usage_count DESC;

-- 4. Kiểm tra orders có order_date trong năm 2024 không
SELECT 'Orders in 2024:' as check_type;
SELECT 
    COUNT(*) as total_orders,
    MIN(order_date) as earliest_order,
    MAX(order_date) as latest_order
FROM orders
WHERE YEAR(order_date) = 2024;

-- 5. Test query giống như trong API (by year)
SELECT 'Test Query By Year 2024:' as check_type;
SELECT 
    v.id as voucherId,
    v.code as voucherCode,
    v.name as voucherName,
    COUNT(vuh.id) as usageCount,
    COALESCE(SUM(vuh.discount_amount), 0) as totalDiscountAmount
FROM voucher_usage_histories vuh
JOIN vouchers v ON vuh.voucher_id = v.id
JOIN orders o ON vuh.order_id = o.id
WHERE YEAR(o.order_date) = 2024
GROUP BY v.id, v.code, v.name
ORDER BY usageCount DESC
LIMIT 5;

-- 6. Kiểm tra join giữa các bảng
SELECT 'Check Joins:' as check_type;
SELECT 
    vuh.id as usage_id,
    vuh.voucher_id,
    v.code as voucher_code,
    vuh.order_id,
    o.order_date,
    vuh.discount_amount
FROM voucher_usage_histories vuh
LEFT JOIN vouchers v ON vuh.voucher_id = v.id
LEFT JOIN orders o ON vuh.order_id = o.id
LIMIT 10;
