const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const config = require('../config').get();
const utils = require('./utils');
const request = utils.request;

chai.use(chaiHttp);

let app;

before(function() {

    //Give a generous timeout for server startup
    this.timeout(12000);

    it('Initialized Server', function() {
        app = require('../src/app');
        return app.startup;
    }).timeout(10000);

    it('Connected to Server', function() {
        return request('/api')
            .get('/')
            .then(response => {
                expect(response.status).to.equal(200);
                expect(response.error).to.be.false;
            });
    }).timeout(1000).retries(5);
    
    it('Got Admin auth token', function() {
        return request('/auth')
            .post('/')
            .send(config.testing.credentials.admin)
            .then(response => {
                expect(response.status).to.equal(200);
                expect(response.error).to.be.false;
                expect(response.body.token).to.exist;
                utils.setAuthToken('admin', response.body.token);
            });
    });

});

module.exports = {
    
};