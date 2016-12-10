var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true
  },
  url: {
    type: String,
    unique: true,
    required: true
  },
  note: {
      type: Schema.Types.ObjectId,
      ref: 'Note'
  }
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;