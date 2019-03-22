const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const normalTransport = new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../../logs/' + (process.env.APP_TESTING === 'true' ? 'testing/' : ''), '%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    prepend: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: true
});

const exceptionTransport = new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../../logs/' + (process.env.APP_TESTING === 'true' ? 'testing/' : '') + 'exceptions/', '%DATE%.exceptions'),
    datePattern: 'YYYY-MM-DD',
    prepend: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: true
});

// Only output to the console if we are not in testing mode.
const logger = process.env.APP_TESTING === 'true' ? 
    new(winston.Logger)({
        transports: [
            normalTransport
        ],
        exceptionHandlers: [
            normalTransport,
            exceptionTransport
        ],
        exitOnError: false
    })
    :
    new(winston.Logger)({
        transports: [
            normalTransport,
            new winston.transports.Console()
        ],
        exceptionHandlers: [
            normalTransport,
            new winston.transports.Console(),
            exceptionTransport
        ],
        exitOnError: false
    })

function info(data) {
    return log("info", data.message, data.status, data.additionalData, data.stack);
}

function warn(data) {
    return log("warn", data.message, data.status, data.additionalData, data.stack);
}

function error(data) {
    return log("error", data.message, data.status, data.additionalData, data.stack);
}

function request(data) {
    return log("info", data.message, data.status, data.additionalData, data.stack);
}

function log(level, message, status, additionalData, stack) {
    const messageObject = {};

    if (status) {
        messageObject.status = status;
    }
    if (additionalData) {
        messageObject.additionalData = additionalData;
    }
    if (stack) {
        messageObject.stack = stack;
    }
    return logger.log(level, message, messageObject);
}

module.exports = {
    info,
    warn,
    error,
    request
};