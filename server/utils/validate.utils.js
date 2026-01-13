// server/utils/validate.utils.js

const checkMissingParams = (params, requiredFields) => {
    const missing = requiredFields.filter(field => !params[field]);
    return missing.length > 0 ? `Thiếu thông tin: ${missing.join(', ')}` : null;
};

const isValidDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
};

module.exports = { checkMissingParams, isValidDateRange };