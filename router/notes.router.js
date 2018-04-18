
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);


router.get('/notes', (req, res, next) => {
	const {searchTerm} = req.query;
	notes.filter(searchTerm, (err, list = [] ) => { /* type cast like 'int myInt' or 'string myString' in JAVA */
		if(err !== null) {
			return next(err);
		}
		res.json(list);
	});
});

router.get('/notes/:id', (req, res, next) => {
	const id = req.params.id;
	notes.find(id, (err, note = {}) => {  /* type cast like 'int myInt' or 'string myString' in JAVA */
		if(err !== null) {
			return next(err);
		}
		res.json(note);
	});
});

router.put('/notes/:id', (req, res, next) => {
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

// Post (insert) an item
router.post('/notes', (req, res, next) => {
	const { title, content } = req.body;

	const newItem = { title, content };
	/***** Never trust users - validate input *****/
	if (!newItem.title) {
		const err = new Error('Missing `title` in request body');
		err.status = 400;
		return next(err);
	}

	notes.create(newItem, (err, item) => {
		if (err) {
			return next(err);
		}
		if (item) {
			res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
		} else {
			next();
		}
	});
});

router.delete('/notes/:id', (req, res, next) => {
	const id = req.params.id;
	notes.find(id, (err) => {  /* type cast like 'int myInt' or 'string myString' in JAVA */
		if(err !== null) {
			return next(err);
		}
		notes.delete(id, (err, length) => {
			console.log(err, length);
			if(err !== null) {
				return next(err);
			} else if( length !== 1) {
				return next(err);
			}
			res.status(204).json({ message: 'No Content' });
		});
	});
});

module.exports = router;
