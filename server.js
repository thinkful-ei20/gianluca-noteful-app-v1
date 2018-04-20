
const express = require('express');
const morgan = require('morgan');

const notesRouter = require('./router/notes.router');
const { PORT } = require('./config');

const app = express();

app.use(express.static('public')); //create a static webserver
app.use(express.json()); //parse request body
app.use(morgan('dev')); //log all requets

/* ============== ROUTERS ============= */

// Mount a router on "/api"
app.use('/api', notesRouter);


/* ========== ERROR HANDLERS ========== */

// Catch-all 404
app.use(function (req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Catch-all Error handler
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.json({
		message: err.message || 'Something went wrong!',
		error: err
	});
});

// Listen for incoming connections
if(require.main === module) {
	app.listen(PORT, function() {
		console.info(`Server listening on ${this.address().port}`);
	}).on('error', err => {
		console.error(err);
	});
}

module.exports = app; // Export for testing
