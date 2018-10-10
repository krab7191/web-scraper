
// Import required packages
const express = require("express"),
    // mongoose = require("mongoose"),
    exphbs = require("express-handlebars"),
    logger = require("morgan"),
    path = require("path");

// Set port for Heroku
const PORT = process.env.PORT || 9000;

// Init app
var app = express();

// -- Set middleware -- //
// Logger
app.use(logger("dev"));
// request handling
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve static files
app.use(express.static(path.join(__dirname, "public")));
// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routing
require("./routes/routes")(app);

app.listen(PORT, err => {
    if (err) { throw err; }
    console.log(`Server listening on port ${PORT}`);
});