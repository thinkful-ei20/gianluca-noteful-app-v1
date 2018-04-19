
const express = require('express');

const router = express.Router();

// In-Memory Database
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);

// Get All items
router.get('/notes', (req, res, next) => {
	const {searchTerm} = req.query;
	notes.filter(searchTerm)
		.then( list => {
			if(list) {
				res.status(200).json(list);
			} else {
				next();
			}
		})
		.catch(err => {
			next(err);
		});
});

// Get a single item
router.get('/notes/:id', (req, res, next) => {
	const id = req.params.id;
	notes.find(id)
		.then(item => {
			if (item) {
				res.status(200).json(item);
			} else {
				next();
			}
		})
		.catch(err => {
			next(err);
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

	notes.update(id, updateObj)
		.then(item => {
			if(item) {
				console.log(item);
				res.status(201).json({ message: 'Updated', id: item.id});
			} else {
				next();
			}
		})
		.catch( err => {
			next(err);
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

	notes.create(newItem)
		.then(item => {
			if(item) {
				res.status(201).json(item);
			} else {
				next();
			}
		})
		.catch( err => {
			next(err);
		});
});

router.delete('/notes/:id', (req, res, next) => {
	const id = req.params.id;
	notes.delete(id)
		.then((len) => {
			res.status(204).json({message:'No Content'});
		})
		.catch( err => {
			next(err);
		});
});

module.exports = router;
