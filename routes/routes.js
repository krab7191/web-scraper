
// import modules
const axios = require("axios"),
    cheerio = require('cheerio'),
    mongoose = require("mongoose");

// Get all combined database models
var db = require("../models");

// Connect to mongoose
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

const urls = ["https://www.aljazeera.com"];

// Set global reponse object to be used by all functions
let responseObject = {};

// -- FUNCTIONS -- //

// Scrape the passed url
function scrape(obj, callback) {
    let url = obj.link;
    console.log(`Begin scraping '${url}'`);
    axios.get(url).then(response => {
        console.log(`Scrape done`);
        if (url === urls[0]) {
            alJazeeraHandler(response.data);
        }
        // Auxilliary urls... (Get summary from Al Jazeera)
        else {
            let $ = cheerio.load(response.data);
            obj.summary = $("p.article-heading-des").text();
            console.log(obj);
            callback(obj);
        }
    });
}

// Given the alJazeera page, filter out article titles and links, pass Obj to callback
function alJazeeraHandler(data) {
    console.log(`AlJazeeraHandler...`);
    let $ = cheerio.load(data);
    const elem = $("div.latest-news-topic");
    const len = elem.length;
    elem.each((i, element) => {
        console.log(`news-topic: ${i}`);
        var result = {};
        result.title = $(element).children('a').text();
        result.link = urls[0] + $(element).children('a').attr("href");
        if (i === len - 1) {
            compareArticle(result, true);
        }
        else {
            compareArticle(result, false);
        }
    });
}

// Given an object, create new DB document
function saveArticle(obj) {
    console.log(`Saving article: ${obj.title.slice(0, 10)}`);
    db.Article.create(obj).then(dbResp => {
        console.log(`Database response: ${dbResp}`);
        if (!responseObject.headerSent) {
            responseObject.json(dbResp);
        }
    }).catch((err) => {
        console.log(`Database err: ${err}`);
        if (!responseObject.headerSent) {
            responseObject.json(err);
        }
    });
}

// Get all articles from the database
function getAllArticles(res) {
    db.Article.find({}).then(results => {
        res.render("home", { article: results });
    }).catch((err) => {
        console.log(`getAllArticles: ${err}`);
        res.json(err);
    });
}

// Compare entries in the database to recently scraped article to avoid adding duplicates
function compareArticle(resultObj, finished) {
    // Compare with the existing articles
    db.Article.findOne(resultObj).then(results => {
        if (results === null) {
            // New article: Get summary and save in DB
            console.log(`'${resultObj.title.slice(0, 10)}...' is a new article!`);
            scrape(resultObj, saveArticle);
        }
        else {
            // Already exists in DB, do nothing
            console.log(`Exists! ${results.title.slice(0, 10)}...`);
            if (finished) {
                responseObject.json({ message: "Scrape complete" });
            }
        }
    }).catch((err) => {
        console.log(`DB error: ${err}`);
        if (!responseObject.headerSent) {
            responseObject.json(err);
        }
    });
}

// Export the API routes
module.exports = function (app) {

    // Post request with user's desired topic to look for when scraping
    app.post("/scrape", function (req, res) {
        responseObject = res;
        let topic = req.body.topic;
        scrape({ link: urls[0] });
    });

    app.get("/", (req, res) => {
        getAllArticles(res);
    });
};