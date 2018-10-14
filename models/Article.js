
const mongoose = require("mongoose");
// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new ArticleSchema object
const ArticleSchema = new Schema({
    // `title` is required and of type String
    title: {
        type: String,
        required: true
    },
    // Summary of the article
    summary: {
        type: String,
        required: true
    },
    // `link` is required and of type String
    link: {
        type: String,
        required: true
    },
    imgsrc: String,
    date: {
        type: Date,
        default: Date.now
    },
    // `comments` is an object that stores an array of ids
    // The ref property links the ObjectId to the Comment model
    // This allows us to populate the Article with an associated comments
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

// This creates our model from the above schema, using mongoose's model method
const Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;