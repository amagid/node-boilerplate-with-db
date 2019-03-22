const config = require('../../config').get().maps;
const logger = require('./logger');
const Promise = require('bluebird');
const googleMaps = require('@google/maps').createClient({
    key: config.apiKey,
    Promise
});

/**
 * Converts a string address to global lat/long coordinates.
 * Since this is a non-critical operation, the returned Promise always resolves.
 * In the case of a failure, it simply returns null and logs the error.
 * @param {string} address 
 * @returns {Promise<Object>} An object containing the lat/long coordinates of the address
 */
function geocode(address) {
    return googleMaps.geocode({
        address
    }).asPromise()
    .then(response => {
        return response.json.results[0].geometry.location;
    })
    .catch(err => {
        logger.warn({ message: 'Geocoding Failed', additionalData: err });
        throw APIError(500, 'Map Update Failed', err);
    });
}

/**
 * Converts global lat/long coodinates to the nearest street address.
 * Since this is a non-critical operation, the returned Promise always resolves.
 * In the case of a failure, it simply returns null and logs the error.
 * @param {number} latitude The latitude coordinate.
 * @param {number} longitude The longitude coordinate.
 * @returns {Promise<string>} The nearest street address to the coordinates.
 */
function reverseGeocode(latitude, longitude) {
    return googleMaps.reverseGeocode({
        latlng: [longitude, latitude],
        result_type: ['street_address']
    }).asPromise()
    .then(response => {
        return response.json.results[0].formatted_address;
    })
    .catch(err => {
        logger.warn({ message: 'Geocoding Failed', additionalData: err });
        return null;
    });
}

module.exports = {
    geocode,
    reverseGeocode
};