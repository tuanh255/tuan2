import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Export lẻ (Named export)
export const formatToVN = (date) => {
    if (!date) return '---';
    return dayjs.utc(date).tz("Asia/Ho_Chi_Minh").format('HH:mm DD/MM/YYYY');
};

// Export mặc định (Default export) - ĐÂY LÀ DÒNG CÒN THIẾU
export default dayjs;