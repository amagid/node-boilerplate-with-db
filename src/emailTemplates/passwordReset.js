const urls = require('../../config').get().urls;
const emailConfig = require('../../config').get().mailer;

/**
 * Generate an email to send to a user in response to their request to reset their password
 * 
 * @param {String} fname 
 * @param {String} token 
 * @returns {Object} {subject, html}
 */
function generatePasswordResetEmail(fname, token) {
    return {
        subject: `${emailConfig.subjectPrefix}Reset Your Password`,
        html: `Hi ${fname},<br/><br/>
                We just received a request to reset your password.<br/><br/>
                If you requested this reset, <a style="font-weight: bold" href="${urls.baseUrl + emailConfig.routes.passwordReset}?token=${token}">click here to reset your password.</a><br/><br/>
                If you did not request this reset, please contact your account administrator immediately to have them reset your account authentication.`
    };
}

module.exports = generatePasswordResetEmail;