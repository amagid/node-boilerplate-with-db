const smsConfig = require('../../config').get().sms;
const twilio = { messages: { create: () => Promise.resolve() } };//new (require('twilio'))(smsConfig.sid, smsConfig.authToken); //TODO: Sort out Twilio and re-enable
const smsTemplates = require('../smsTemplates');
const logger = require('./logger');

function send(to, template) {
    return twilio.messages.create({
        to,
        from: smsConfig.fromPhone,
        body: template.body
    }).then(result => {
        logger.info({ message: "SMS Sent Successfully", status: 200 });
        return { message: "SMS Sent Successfully" };
    }).catch(err => {
        //TODO: More detailed Twilio error handling
        throw APIError(500, "SMS Send Failed", err);
    });
}

module.exports = {
    send
};