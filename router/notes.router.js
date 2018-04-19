
const express = require('express');

const router = express.Router();

// In-Memory Database
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);

// Get All items
router.get('/notes', (req, res, next) => {
	const {searchTerm} = req.query;
	notes.filter(searchTerm, (err, list = [] ) => {
		if(err) {
			return next(err);
		}
		res.json(list);
	});
});

// Get a single item
router.get('/notes/:id', (req, res, next) => {
	const id = req.params.id;
	notes.find(id, (err, note = {}) => {
		if(err) {
			return next(err);
		}
		res.json(note);
	});
});

// Update an item
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

/**
 *	If we assume 'err' is null, then this statement...
 *		
 *		let err = null;
 * 			if(err) {
 * 				console.log('error');
 * 			}
 * 
 *	...will never execute because null evaluates to 'false'.
 */

router.delete('/notes/:id', (req, res, next) => {
	const id = req.params.id;
	notes.delete(id, (err, length) => {
		if(err) {
			return next(err);
		}
		res.status(204).json({ message: 'No Content' });
	});
});

module.exports = router;
