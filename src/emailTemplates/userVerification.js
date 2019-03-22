const urls = require('../../config').get().urls;
const emailConfig = require('../../config').get().mailer;

/**
 * Generate an email to send to a user to verify their account
 * 
 * @param {String} fname 
 * @param {String} token 
 * @returns {Object} {subject, html}
 */
function generateUserVerificationEmail(fname, token) {
    return {
        subject: `${emailConfig.subjectPrefix}Confirm Your Account`,
        html: `Hi${fname ? ` ${fname}` : ''},<br/><br/>
                An account has been created for you.<br/><br/>
                <a style="font-weight: bold" href="${urls.baseUrl + emailConfig.routes.userVerification}?token=${token}&type=signup">Click here to confirm your account and set your password.</a><br/><br/>
                If you received this message in error, please delete it immediately.`
    };
}

module.exports = generateUserVerificationEmail;