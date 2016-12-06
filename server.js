// Dependencies
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var express = require('express');
var exphbs = require('express-handlebars');
var logger = require('morgan');
var mongoose = require('mongoose');
var request = require('request');

// set up Express app functionality
var app = express();


// To log user activity
app.use(logger('dev'));

// Express setup to use static files (css, img, etc.) from the '/public' directory
app.use(express.static(process.cwd() + '/public'));

// Express setup to use body-parser for easy access to request data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({
	extended: false
}));


// Handlebars view engine
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


// Central controller routes
var routes = require('./controllers/newsScraper-controller.js');
app.use('/', routes);


// connect to localhost MongoDB
// mongoose.connect('mongodb://localhost/newsScraper');
// connect to livehost MongoDB
mongoose.connect('mongodb://heroku_2p385tts:ublglb8ku4ch93e0ji2hh0utav@ds127878.mlab.com:27878/heroku_2p385tts');
var db = mongoose.connection;

// Display mongoose errors
db.on('error', function(err) {
  console.log('Mongoose error: ', err);
});

// log a successful connection message
db.once('open', function() {
  console.log('*******************************');	
  console.log('Mongoose connection successful!');
  console.log('*******************************');
});


// Express app setup to listen on port 3000
app.listen(process.env.PORT || 3000, function() {
	if (process.env.PORT == undefined) {
		console.log('The server is listening on port 3000');
	} else {
    	console.log('The server islistening on port: ' + process.env.PORT);
    }
});
