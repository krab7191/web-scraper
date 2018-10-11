// -- Helper functions for DB and cheerio -- //

// import modules
const axios = require("axios");
const cheerio = require("cheerio");

// Get all combined database models
const db = require("../models");

const urls = [
    {
        link: "https://www.aljazeera.com"
    }
];

let keyword;

// -- FUNCTIONS -- //

module.exports = {

    // Scrape the passed url
    scrape: function (obj, respObj, finished) {
        let url = obj.link;
        console.log(`Begin scraping '${url}'`);
        axios.get(url).then(response => {
            console.log(`${url} scrape finished`);
            if (url === urls[0].link) {
                this.alJazeeraHandler(response.data, respObj);
            }
            // Get summary from Al Jazeera
            else {
                let $ = cheerio.load(response.data);
                obj.summary = $("p.article-heading-des").text();
                this.saveArticle(obj, respObj, finished);
            }
        }).catch((err) => {
            console.log(`Axios error: ${err}`);
            respObj.render("home", { article: [{ summary: `Error scraping ${url}. Please try again later.` }] })
        });
    },

    // Given the alJazeera page, filter out article titles and links, pass Obj to callback
    alJazeeraHandler: function (data, respObj) {
        console.log(`AlJazeera data Handler...`);
        let $ = cheerio.load(data);
        const elem = $("div.latest-news-topic");
        const len = elem.length;
        elem.each((i, element) => {
            var result = {};
            result.title = $(element).children('a').text();
            result.link = urls[0].link + $(element).children('a').attr("href");
            // Since it's async, only say finished on the last one.
            console.lo
            if (i === len - 1) {
                this.compareArticle(result, true, respObj);
            }
            else {
                this.compareArticle(result, false, respObj);
            }
        });
    },

    // Given an object, create new DB document
    saveArticle: function (obj, res, finished) {
        console.log(`Saving article: ${obj.title.slice(0, 10)}`);
        db.Article.create(obj).then(dbResp => {
            if (finished) {
                console.log("Finished saving articles");
                this.getArticles(res, filter);
            }
        }).catch((err) => {
            console.log(`Database err: ${err}`);
            res.writeContinue(err);
        });
    },

    // Get articles, filtered by most recent, then by user's keyword
    getArticles: function (res, filter) {
        keyword = filter;
        console.log(`Getting articles...`);
        console.log(`Filter: ${filter}`);
        db.Article.find({})
            .populate('comments')
            .limit(25)
            .sort({ date: 1 })
            .then(results => {
                if (results.length > 0) {
                    if (filter) {
                        results = this.filterResults(results, filter);
                        results.unshift({ filteredBy: filter });
                    }
                    console.log("Render page with articles from database.");
                    console.log(results);
                    res.render("home", { article: results });
                    // Clear filter
                    keyword = "";
                }
                else {
                    keyword = filter;
                    console.log("No existing articles...");
                    this.scrape(urls[0], res);
                }
            }).catch((err) => {
                console.log(`Error getting articles: ${err}`);
                res.writeContinue(err);
            });
    },

    // Compare entries in the database to recently scraped article to avoid adding duplicates
    compareArticle: function (resultObj, finished, res) {
        // Compare with the existing articles
        db.Article.findOne(resultObj).then(results => {
            if (results === null) {
                // New article: Get summary and save in DB
                console.log(`'${resultObj.title.slice(0, 10)}...' is a new article!`);
                this.scrape(resultObj, res, finished);
            }
            else {
                // Already exists in DB, do nothing
                console.log(`Exists! ${results.title.slice(0, 10)}...`);
                if (finished) {
                    console.log("Finished comparing articles");
                }
            }
        }).catch((err) => {
            console.log(`DB error: ${err}`);
            res.writeContinue(err);
        });
    },
    // Search each articles title and summary section
    filterResults: function (articles, filter) {
        let results = [];
        articles.forEach(element => {
            // Ignore case with regex /i
            const regex = new RegExp(filter, "i");
            if (element.title.match(regex) || element.summary.match(regex)) {
                results.push(element);
            }
        });
        return results;
    }

};