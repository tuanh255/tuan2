const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// Ép mọi tính toán ở Backend về múi giờ VN
const vnDayjs = (date) => dayjs(date).tz("Asia/Ho_Chi_Minh");

module.exports = vnDayjs;