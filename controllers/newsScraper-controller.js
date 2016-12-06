var cheerio = require('cheerio');
var express = require('express');
var mongoose = require('mongoose');
var request = require('request');
var router = express.Router();

var Note = require('../models/note.js');
var Article = require('../models/Article.js');

router.get('/', function(req, res) {
    res.render('index');
});

router.get('/scrape', function(req, res) {
    request('https://news.ycombinator.com/', function(error, response, html) {
        if (error) {
            console.log('Error with request: ' + error);
        }
        console.log('Response status code: ' + response.statusCode);
        if (response.statusCode === 200) {
            var $ = cheerio.load(html);
            var resArray = [];
            $('.c-entry-box__title').each(function(i, element) {
                var data = {};
                data.title = $(this).children('a').text();
                data.link = $(this).children('a').attr('href');

                resArray.push(data);

                var entry = new Article(data);

                entry.save(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        return;
                    }
                })
            });
            var hbsObj = { articles: resArray };
            res.json(hbsObj);
        }
    });
});

router.get('/articles', function(req, res) {
    Article.find({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

router.get('/articles/:id', function(req, res) {
    Article.findOne({ '_id': req.params.id })
        .populate('note')
        .exec(function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                res.json(doc);
            }
        });
});


router.post('/articles/:id', function(req, res) {
    var newNote = new Note(req.body);
    newNote.save(function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            Article.findOneAndUpdate({ '_id': req.params.id }, { 'note': doc._id })
                .exec(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send(doc);
                    }
                });
        }
    });
});

router.delete('/articles/:id', function(req, res) {
	console.log('req.params.id: ' + req.params.id);
	Article.findOne({'_id': req.params.id})
		.exec(function(err, doc) {
			if (err) {
				console.log(err);
			} else {
				Note.findByIdAndRemove(doc.note, function(err, note) {
					if (err) {
						console.log(err);
					} else {
						res.send(note);
					}
				})
			}
		})
});

console.log('Controller --> Centralized controller (newsScraper-controller.js');

module.exports = router;