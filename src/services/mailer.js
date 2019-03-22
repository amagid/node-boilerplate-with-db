const sendGrid = require('@sendgrid/mail');
const mailerConfig = require('../../config').get().mailer;
const emailTemplates = require('../emailTemplates');
const logger = require('./logger');
const APIError = require('../APIError');
sendGrid.setApiKey(mailerConfig.apiKey);

function sendUserVerificationEmail(email, fname, token) {
    return send(email, emailTemplates.userVerification(fname, token));
}

function sendPasswordResetEmail(email, fname, token) {
    return send(email, emailTemplates.passwordReset(fname, token));
}

function send(to, template) {
    return sendGrid.send({
        to,
        from: mailerConfig.fromEmail,
        subject: template.subject,
        html: template.html
    }).then(result => {
        logger.info({ message: "Email Sent Successfully", status: 200 });
        return { message: "Email Sent Successfully" };
    }).catch(err => {
        //TODO: More detailed SendGrid error handling
        throw APIError(500, "Email Send Failed", err);
    });
}

module.exports = {
    sendUserVerificationEmail,
    sendPasswordResetEmail
};