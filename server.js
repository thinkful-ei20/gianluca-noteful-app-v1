
const express = require('express');
const data = require('./db/notes');
const simDB = require('./db/simDB');
const notes = simDB.initialize(data);
const { PORT } = require('./config');
const { logger } = require('./middleware/logger');
const app = express();

app.use(express.static('public'));

app.use(express.json());

app.use(logger);

app.get('/api/notes', (req, res, next) => {
	const {searchTerm} = req.query;
	notes.filter(searchTerm, (err, list = [] ) => { /* type cast like 'int myInt' or 'string myString' in JAVA */
		if(err !== null) {
			return next(err);
		}
		res.json(list);
	});
});

app.get('/api/notes/:id', (req, res, next) => {
	const id = req.params.id;
	notes.find(id, (err, note = {}) => {  /* type cast like 'int myInt' or 'string myString' in JAVA */
		if(err !== null) {
			return next(err);
		}
		res.json(note);
	});
});

app.put('/api/notes/:id', (req, res, next) => {
	const id = req.params.id;

	/***** Never trust users - validate input *****/
	const updateObj = {};
	const updateFields = ['title', 'content'];

	updateFields.forEach(field => {
		if (field in req.body) {
			updateObj[field] = req.body[field];
		}
	});

	notes.update(id, updateObj, (err, item) => {
		if (err) {
			return next(err);
		}
		if (item) {
			res.json(item);
		} else {
			next();
		}
	});
});

app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.json({
		message: err.message || 'Something went wrong!',
		error: err
	});
});

app.listen(PORT, function() {
	console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
	console.error(err);
});
