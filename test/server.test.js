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


describe('GET /api/notes', () => {

	it('should return the default of 10 Notes as an array',() => {

		chai.request(app)
			.get('/api/notes')
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('array');
				expect(res.body.length).to.be.at.least(10);
			});
	});

	it('should return an array of objects with the id, title, and content', () => {

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

	it('should return correct search results for a valid query', () => {

		chai.request(app)
			.get('/api/notes?searchTerm=way')
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('array');
				expect(res.body.length).to.be.at.least(3);
				const expectedKeys = ['id', 'title', 'content'];
				res.body.forEach(function(item) {
					expect(item).to.be.a('object');
					expect(item).to.include.keys(expectedKeys);
				});
			});
	});

	it('should return an empty array for an incorrect query', () => {

		chai.request(app)
			.get('/api/notes?searchTerm=lkjasdoiqhn')
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('array');
				expect(res.body.length).to.be.at.least(0);
			});
	});
});


describe('GET /api/notes/:id', () => {
	it('should return correct note object with id, title and content for a given id',() => {

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

	it('should respond with a 404 for an invalid id (/api/notes/DOESNOTEXIST)',() => {

		chai.request(app)
			.get('/api/notes/DOESNOTEXIST')
			.then(res => {
				expect(res).to.have.status(404);
			});
	});
});

describe('POST /api/notes', () => {

	it('should create and return a new item with location header when provided valid data', () => {
		const newNote= {title:'title', content: 'content'};
		chai.request(app)
			.post('/api/notes')
			.send(newNote)
			.then(res => {
				newNote.id = res.body.id;
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('id', 'title', 'content');
				expect(res.body.id).to.not.equal(null);
				// response should be deep equal to `newNote` from above if we assign
				// `id` to it from `res.body.id`
				expect(res.body).to.deep.equal(newNote);
			});
	});

	it('should return an object with a message property "Missing title in request body" when missing "title" field', () => {
		const newNote= {content: 'no title'};
		chai.request(app)
			.post('/api/notes')
			.send(newNote)
			.then(res => {
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('message');
				expect(res.body.message).to.equal('Missing `title` in request body');
			});
	});
});

describe('PUT /api/notes/:id', () => {
	it('should update and return a note object when given valid data', () => {
		const newNote= {title:'title', content: 'content'};
		chai.request(app)
			.get('/api/notes/')
			.then(res => {
				newNote.id = res.body.id;
				return chai.request(app)
					.post(`/api/notes/${newNote.id}`)
					.send(newNote)
					.then(res => {
						expect(res).to.have.status(201);
						expect(res).to.be.json;
						expect(res.body).to.be.a('object');
						expect(res.body).to.include.keys('id', 'title', 'content');
						expect(res.body.id).to.not.equal(null);
						expect(res.body).to.deep.equal(newNote);
					});
			});
	});

	it('should respond with a 404 for an invalid id (/api/notes/DOESNOTEXIST)', () => {
		const newNote= {title:'title', content: 'content'};
		chai.request(app)
			.put('/api/notes/DOESNOTEXIST')
			.send(newNote)
			.then(res => {
				expect(res).to.have.status(404);
			});
	});

	it('should return an object with a message property "Missing title in request body" when missing "title" field', () => {
		const newNote= {content: 'no title'};
		chai.request(app)
			.get('/api/notes/')
			.then(res => {
				newNote.id = res.body.id;
				return chai.request(app)
					.post(`/api/notes/${newNote.id}`)
					.send(newNote)
					.then(res => {
						expect(res).to.be.json;
						expect(res.body).to.be.a('object');
						expect(res.body).to.include.keys('message');
						expect(res.body.message).to.equal('Missing `title` in request body');
					});
			});
	});
});


describe('DELETE /api/notes/:id', () => {

	it('should delete an item by id' ,() => {
		chai.request(app)
			.get('/api/notes/')
			.then(res => {
				const id = res.body[0].id;
				console.log(id);
				return chai.request(app)
					.delete(`/api/notes/${id}`)
					.then(res => {
						expect(res).to.have.status(204);
						expect(res.body.message).to.equal('No Content');
					});
			});
	});
});
