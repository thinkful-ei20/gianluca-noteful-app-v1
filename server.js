

const express = require('express');
const data = require('./db/notes');
const app = express();

app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
	req.query.searchTerm ? res.json(data.filter(note => note.title.includes(req.query.searchTerm))) : res.json(data);
	//MENTOR SESSION
});

app.get('/api/notes/:id', (req, res) => {
	res.json(data.find(item => item.id === Number(req.params.id)));
});

app.listen(8080, function() {
	console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
	console.error(err);
});
