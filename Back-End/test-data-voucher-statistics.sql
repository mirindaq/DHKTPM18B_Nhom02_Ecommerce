-- =====================================================
-- TEST DATA CHO THỐNG KÊ VOUCHER
-- =====================================================

-- 1. Thêm vouchers (5 vouchers để test)
-- Lưu ý: voucher_type là enum: 0=ALL, 1=GROUP, 2=RANK
INSERT INTO vouchers (code, name, description, start_date, end_date, active, min_order_amount, max_discount_amount, discount, voucher_type, ranking_id, created_at, modified_at)
VALUES
-- Voucher 1: Giảm giá mùa hè (sẽ được dùng nhiều nhất)
('SUMMER2024', 'Giảm giá mùa hè', 'Giảm 10% cho đơn hàng từ 500k', '2024-06-01', '2024-12-31', true, 500000, 200000, 10, 0, NULL, NOW(), NOW()),

-- Voucher 2: Freeship (được dùng nhiều thứ 2)
('FREESHIP50', 'Miễn phí vận chuyển', 'Giảm 50k phí ship cho đơn từ 300k', '2024-01-01', '2024-12-31', true, 300000, 50000, 50000, 0, NULL, NOW(), NOW()),

-- Voucher 3: Giảm giá tân sinh viên (được dùng nhiều thứ 3)
('STUDENT20', 'Ưu đãi sinh viên', 'Giảm 20% cho sinh viên', '2024-09-01', '2024-12-31', true, 200000, 150000, 20, 1, NULL, NOW(), NOW()),

-- Voucher 4: Black Friday (được dùng ít hơn)
('BLACKFRIDAY', 'Black Friday Sale', 'Giảm 30% cho Black Friday', '2024-11-20', '2024-12-05', true, 1000000, 500000, 30, 0, NULL, NOW(), NOW()),

-- Voucher 5: Khách hàng VIP (được dùng ít nhất)
('VIP100', 'Ưu đãi VIP', 'Giảm 100k cho khách VIP', '2024-01-01', '2024-12-31', true, 1500000, 100000, 100000, 2, NULL, NOW(), NOW());

-- =====================================================
-- 2. XÓA DỮ LIỆU CŨ (nếu đã chạy script trước đó)
-- =====================================================
DELETE FROM voucher_usage_histories WHERE voucher_id IN (SELECT id FROM vouchers WHERE code IN ('SUMMER2024', 'FREESHIP50', 'STUDENT20', 'BLACKFRIDAY', 'VIP100'));
DELETE FROM vouchers WHERE code IN ('SUMMER2024', 'FREESHIP50', 'STUDENT20', 'BLACKFRIDAY', 'VIP100');

-- =====================================================
-- 3. Thêm lại vouchers (sau khi xóa)
-- =====================================================
INSERT INTO vouchers (code, name, description, start_date, end_date, active, min_order_amount, max_discount_amount, discount, voucher_type, ranking_id, created_at, modified_at)
VALUES
('SUMMER2024', 'Giảm giá mùa hè', 'Giảm 10% cho đơn hàng từ 500k', '2024-06-01', '2024-12-31', true, 500000, 200000, 10, 0, NULL, NOW(), NOW()),
('FREESHIP50', 'Miễn phí vận chuyển', 'Giảm 50k phí ship cho đơn từ 300k', '2024-01-01', '2024-12-31', true, 300000, 50000, 50000, 0, NULL, NOW(), NOW()),
('STUDENT20', 'Ưu đãi sinh viên', 'Giảm 20% cho sinh viên', '2024-09-01', '2024-12-31', true, 200000, 150000, 20, 1, NULL, NOW(), NOW()),
('BLACKFRIDAY', 'Black Friday Sale', 'Giảm 30% cho Black Friday', '2024-11-20', '2024-12-05', true, 1000000, 500000, 30, 0, NULL, NOW(), NOW()),
('VIP100', 'Ưu đãi VIP', 'Giảm 100k cho khách VIP', '2024-01-01', '2024-12-31', true, 1500000, 100000, 100000, 2, NULL, NOW(), NOW());

-- =====================================================
-- 4. Thêm voucher_usage_histories (lịch sử sử dụng voucher)
-- =====================================================

-- Lấy voucher_id trước để tránh lỗi subquery
SET @summer_id = (SELECT id FROM vouchers WHERE code = 'SUMMER2024' LIMIT 1);
SET @freeship_id = (SELECT id FROM vouchers WHERE code = 'FREESHIP50' LIMIT 1);
SET @student_id = (SELECT id FROM vouchers WHERE code = 'STUDENT20' LIMIT 1);
SET @blackfriday_id = (SELECT id FROM vouchers WHERE code = 'BLACKFRIDAY' LIMIT 1);
SET @vip_id = (SELECT id FROM vouchers WHERE code = 'VIP100' LIMIT 1);

-- SUMMER2024 - Được dùng nhiều nhất (15 lần)
INSERT INTO voucher_usage_histories (voucher_id, order_id, discount_amount, created_at, modified_at)
SELECT 
    @summer_id,
    o.id,
    LEAST(o.total_price * 0.1, 200000),
    o.order_date,
    o.order_date
FROM orders o
ORDER BY o.id
LIMIT 15;

-- FREESHIP50 - Được dùng nhiều thứ 2 (12 lần)
INSERT INTO voucher_usage_histories (voucher_id, order_id, discount_amount, created_at, modified_at)
SELECT 
    @freeship_id,
    o.id,
    50000,
    o.order_date,
    o.order_date
FROM orders o
WHERE o.id NOT IN (SELECT order_id FROM voucher_usage_histories)
ORDER BY o.id
LIMIT 12;

-- STUDENT20 - Được dùng nhiều thứ 3 (10 lần)
INSERT INTO voucher_usage_histories (voucher_id, order_id, discount_amount, created_at, modified_at)
SELECT 
    @student_id,
    o.id,
    LEAST(o.total_price * 0.2, 150000),
    o.order_date,
    o.order_date
FROM orders o
WHERE o.id NOT IN (SELECT order_id FROM voucher_usage_histories)
ORDER BY o.id
LIMIT 10;

-- BLACKFRIDAY - Được dùng ít hơn (7 lần)
INSERT INTO voucher_usage_histories (voucher_id, order_id, discount_amount, created_at, modified_at)
SELECT 
    @blackfriday_id,
    o.id,
    LEAST(o.total_price * 0.3, 500000),
    o.order_date,
    o.order_date
FROM orders o
WHERE o.id NOT IN (SELECT order_id FROM voucher_usage_histories)
ORDER BY o.id
LIMIT 7;

-- VIP100 - Được dùng ít nhất (5 lần)
INSERT INTO voucher_usage_histories (voucher_id, order_id, discount_amount, created_at, modified_at)
SELECT 
    @vip_id,
    o.id,
    100000,
    o.order_date,
    o.order_date
FROM orders o
WHERE o.id NOT IN (SELECT order_id FROM voucher_usage_histories)
ORDER BY o.id
LIMIT 5;

-- =====================================================
-- 5. KIỂM TRA DỮ LIỆU
-- =====================================================

-- Xem tất cả vouchers
SELECT * FROM vouchers;

-- Xem thống kê số lần sử dụng mỗi voucher
SELECT 
    v.code,
    v.name,
    COUNT(vuh.id) as usage_count,
    SUM(vuh.discount_amount) as total_discount
FROM vouchers v
LEFT JOIN voucher_usage_histories vuh ON v.id = vuh.voucher_id
GROUP BY v.id, v.code, v.name
ORDER BY usage_count DESC;

-- =====================================================
-- 6. NẾU BẠN CHƯA CÓ ĐỦ ORDERS, CHẠY SCRIPT NÀY TRƯỚC
-- =====================================================

-- Tạo thêm orders giả để test (nếu cần)
-- Lưu ý: Thay customer_id bằng ID customer có sẵn trong DB của bạn

/*
INSERT INTO orders (receiver_address, receiver_name, receiver_phone, order_date, status, payment_method, note, is_pickup, total_price, total_discount, final_total_price, customer_id, created_at, modified_at)
SELECT 
    CONCAT('Địa chỉ test ', n),
    CONCAT('Khách hàng ', n),
    CONCAT('090000', LPAD(n, 4, '0')),
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY), -- Random trong 30 ngày qua
    'DELIVERED',
    'CASH',
    'Đơn hàng test',
    false,
    FLOOR(RAND() * 2000000) + 500000, -- Random từ 500k-2.5M
    0,
    FLOOR(RAND() * 2000000) + 500000,
    1, -- Thay bằng customer_id thực tế
    NOW(),
    NOW()
FROM (
    SELECT @row := @row + 1 as n
    FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t1,
         (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t2,
         (SELECT @row := 0) t3
    LIMIT 50
) numbers;
*/


