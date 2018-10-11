
// Import required packages
const express = require("express"),
    mongoose = require("mongoose"),
    exphbs = require("express-handlebars"),
    logger = require("morgan"),
    path = require("path"),
    publicRoutes = require("./routes/public_routes");

// Set port for Heroku
const PORT = process.env.PORT || 3021;

// Init app
var app = express();

// -- Set middleware -- //
// Logger
app.use(logger("dev"));
// request handling
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Routing
app.use(publicRoutes);
// Serve static files
app.use(express.static(path.join(__dirname, "public")));
// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to mongoose
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true }).then(() => {
    app.listen(PORT, err => {
        if (err) { throw err; }
        console.log(`Server listening on port ${PORT}`);
    });
}, err => {
    console.log(`Mongoose connect error: ${err}`);
});
