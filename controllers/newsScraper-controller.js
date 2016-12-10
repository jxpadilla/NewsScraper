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
            var links = $('a.storylink')
            console.log(links);
            
            links.each(function(i, link) {
                var data = {};
                data.title = $(this).text();
                data.url = $(this).attr('href');

                console.log(data.title);

                var entry = new Article(data);
                // identify mongo collection 
                // search to identify duplicates
                // if duplicates are found do not save
                Article.find({title:entry.title}, function(err, articles) {
                    if(articles.length == 0) {
                        entry.save(function(err, doc) {
                            if (err) {
                                // console.log(err);
                            } else {
                                console.log("Save worked for ", entry.title);
                                resArray.push(data);
                                return;

                            }
                        });                           
                    }
                    else{
                        console.log(articles);
                        console.log("length: ", articles.length);
                    }       
                });
                
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

console.log('File in folder Controllers > newsScraper-controller.js');
console.log('');

module.exports = router;