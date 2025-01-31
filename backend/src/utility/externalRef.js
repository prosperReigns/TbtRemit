const generateReferenceNumber = () => {
    const prefix = 'CUS-'; // Custom prefix
    const timestamp = Date.now().toString(); // Current timestamp in milliseconds
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString(); // 6 random digits
    return `${prefix}${timestamp}${randomDigits}`;
};

module.exports = generateReferenceNumber;