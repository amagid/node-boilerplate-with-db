'use strict';
module.exports = (status, message, additionalData) => { return new APIError(status, message, additionalData) };

class APIError extends Error {
    constructor(status, message, additionalData) {
        super();
        this.status = status;
        this.message = message;
        if (additionalData) {
            this.additionalData = additionalData;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}