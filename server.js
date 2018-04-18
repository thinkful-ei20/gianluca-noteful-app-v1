
const express = require('express');

const notesRouter = require('./router/notes.router');

const { PORT } = require('./config');

const morgan = require('morgan');
const app = express();


app.use(express.static('public'));
app.use(express.json());
app.use(morgan('dev'));

/* ============== ROUTERS ============= */
app.use('/api', notesRouter);


/* ========== ERROR HANDLERS ========== */
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
