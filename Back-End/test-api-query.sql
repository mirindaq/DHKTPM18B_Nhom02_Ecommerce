-- Test query chính xác như API sẽ chạy

-- 1. Test với năm 2024 (giống API by year)
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

-- 2. Kiểm tra năm nào có orders
SELECT DISTINCT YEAR(order_date) as year, COUNT(*) as count
FROM orders
GROUP BY YEAR(order_date)
ORDER BY year DESC;

-- 3. Kiểm tra order_date của các orders có voucher
SELECT 
    o.id,
    o.order_date,
    YEAR(o.order_date) as year,
    v.code as voucher_code
FROM voucher_usage_histories vuh
JOIN orders o ON vuh.order_id = o.id
JOIN vouchers v ON vuh.voucher_id = v.id
ORDER BY o.order_date DESC
LIMIT 20;
