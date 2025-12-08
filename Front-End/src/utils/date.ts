// src/utils/date.ts

/**
 * Lấy ra ngày đầu và ngày cuối của tháng, định dạng YYYY-MM-DD
 */
export const getMonthRange = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Ngày đầu tháng (01:00:00)
  const startOfMonth = new Date(year, month, 1, 1);
  // Ngày cuối tháng (23:59:59)
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  const formatToISO = (d: Date) => d.toISOString().split("T")[0];

  return {
    startDate: formatToISO(startOfMonth),
    endDate: formatToISO(endOfMonth),
  };
};

/**
 * Lấy ra phạm vi của tháng hiện tại và tháng trước
 */
export const getCurrentAndPreviousMonthRanges = () => {
  const now = new Date();
  const currentMonthRange = getMonthRange(now);

  // Tính tháng trước
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthRange = getMonthRange(prevMonth);

  return {
    current: currentMonthRange,
    previous: previousMonthRange,
  };
};
