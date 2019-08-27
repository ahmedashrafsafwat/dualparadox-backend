const mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Mixed = Schema.Types.Mixed;


const commentSchema = new mongoose.Schema({
    articleId: String,
    userId:String,
    username:String,
    commentText:String
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
