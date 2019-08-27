const mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Mixed = Schema.Types.Mixed;


const articleSchema = new mongoose.Schema({
    userId: String,
    username: String,
    articleText:String,
    isPublished: {type: Boolean, default: false},
    image: String
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
