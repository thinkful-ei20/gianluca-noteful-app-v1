/* global $ noteful api store */


$(document).ready(function () {
	noteful.bindEventListeners();

	// api.search({}, response => {
	// 	store.notes = response;
	// 	noteful.render();
	// });

	api.search({})
		.then(response => {
			store.notes = response;
			noteful.render();
		});

});