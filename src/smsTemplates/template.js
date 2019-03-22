const urls = require('../../config').get().urls;
const smsConfig = require('../../config').get().sms;

/**
 * Generate an sms to send to a user in response to their request to reset their password
 * 
 * @param {String} name 
 * @returns {Object} {body}
 */
function generatePasswordResetSMS(name) {
    return {
        body:
            '**PASSWORD RESET NOTIFICATION**\n\n' +
            'Hi ' + name + ',\n\n' +
            'We received a request to reset your password. Please visit the link below to finish the process:\n\n' +
            urls.baseUrl + '\n\n' +
            'If you did not request this reset, please notify your account administrator immediately.'
    };
}

module.exports = generatePasswordResetSMS;