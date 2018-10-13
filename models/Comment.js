
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Using the Schema constructor, create a new object
const CommentSchema = new Schema({
    author: String,
    body: String,
    date: {
        type: Date,
        default: Date.now
    }
});

// This creates our model from the above schema, using mongoose's model method
const Comment = mongoose.model("Comment", CommentSchema);

// Export the Comment model
module.exports = Comment;