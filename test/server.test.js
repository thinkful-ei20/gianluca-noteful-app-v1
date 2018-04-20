const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', () => {
	it('should evaluate true.to.be(true)', () => {
		expect(true).to.be.true;
	});

	it('2 + 2 should equal 4', () => {
		expect(2 + 2).to.equal(4);
	});
});


describe('Express static', function () {

	it('GET request "/" should return the index page', function () {
		return chai.request(app)
			.get('/')
			.then(function (res) {
				expect(res).to.exist;
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
	});

});

describe('404 handler', function () {

	it('should respond with 404 when given a bad path', function () {
		return chai.request(app)
			.get('/bad/path')
			.catch(err => err.response)
			.then(res => {
				expect(res).to.have.status(404);
			});
	});
});


describe('/api/notes', () => {
	it('should list all notes on GET',() => {

		chai.request(app)
			.get('/api/notes')
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('array');

				expect(res.body.length).to.be.at.least(1);

				const expectedKeys = ['id', 'title', 'content'];
				res.body.forEach(function(item) {
					expect(item).to.be.a('object');
					expect(item).to.include.keys(expectedKeys);
				});
			});
	});

	it('should list one note on GET for /:id',() => {

		chai.request(app)
			.get('/api/notes')
			.then((res) => {
				let expectedData = res.body[0];
				return chai.request(app)
					.get(`/api/notes/${expectedData.id}`)
					.then((res) => {
						expect(res).to.have.status(200);
						expect(res).to.be.json;
						expect(res.body).to.be.a('object');
						expect(res.body).to.deep.equal(expectedData);
					});
			});
	});
});
