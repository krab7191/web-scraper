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

// -- FUNCTIONS -- //

module.exports = {

    // Scrape the passed url (the link in 'obj')
    scrape: function (obj, respObj, finished, keywd) {
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
                this.saveArticle(obj, respObj, finished, keywd);
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
            let result = {};
            result.title = $(element).children('a').text();
            result.link = urls[0].link + $(element).children('a').attr("href");
            result.imgsrc = "images/aj.ico";
            // Since it's async, only say finished on the last one.
            if (i === len - 1) {
                this.compareArticle(result, true, respObj);
            }
            else {
                this.compareArticle(result, false, respObj);
            }
        });
    },

    // Given an object, create new DB document
    saveArticle: function (obj, res, finished, keywd) {
        console.log(`Saving article: ${obj.title.slice(0, 10)}`);
        db.Article.create(obj).then(dbResp => {
            console.log(dbResp);
            if (finished) {
                console.log("Finished saving articles");
                this.getArticles(res, keywd);
            }
        }).catch((err) => {
            console.log(`Database err: ${err}`);
            res.writeContinue(err);
        });
    },

    // Get articles, filtered by most recent and by user's keyword
    getArticles: function (res, filter) {
        console.log(`Getting articles...`);
        console.log(`Filter: ${filter}`);
        let filterLen;
        if (!filter) {
            filterLen = 0;
        }
        else {
            filterLen = filter.length;
        }
        db.Article.find({})
            .populate('comments')
            .limit(25)
            .sort({ date: -1 })
            .then(results => {
                if (results.length > 0) {
                    if (filter) {
                        results = this.filterResults(results, filter);
                        results.unshift({ filteredBy: filter });
                    }
                    results = this.formatDate(results, results.length, filterLen);
                    console.log("Render page with articles from database.");
                    res.render("home", { article: results });
                }
                else {
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
        console.log(resultObj.imgsrc);
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
                    res.json("/");
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
    },
    formatDate: function (resArr, number, filtered) {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (number < 2 && filtered > 0) {
            return resArr;
        }
        else if (filtered === 0) {
            const d = resArr[0].date;
            const nd = `${months[d.getMonth()]} ${d.getDate()} at ${d.getHours()}:${d.getMinutes()}`;
            console.log(nd);
            resArr[0].latest = nd;
            resArr[1].latest = nd;
        }
        else if (number) {
            const d = resArr[1].date;
            const nd = `${months[d.getMonth()]} ${d.getDate()} at ${d.getHours()}:${d.getMinutes()}`;
            console.log(nd);
            resArr[1].latest = nd;
        }
        return resArr;
    },
    // Get articles as json for testing
    jsonAll: function (res) {
        db.Article.find({})
            .populate('comments')
            .limit(25)
            .sort({ date: 1 })
            .then(results => {
                res.json(results);
            }).catch((err) => {
                console.log(`Error getting articles: ${err}`);
                res.json(err);
            });
    },
    addComment: function (comment, artId, res) {
        db.Comment.create(comment)
            .then(cmmtResp => {
                return db.Article.findOneAndUpdate(
                    { _id: artId },
                    { $push: { comments: cmmtResp._id } },
                    { new: true });
            })
            .then(article => {
                // If we were able to successfully update an Article, reload the page
                res.json("/");
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    },
    deleteComment: function (id, res) {
        db.Comment.deleteOne({
            _id: id
        }).then(resp => {
            res.json("/");
        }).catch(err => {
            console.log(`Error deleting comment: ${err}`);
        });
    }
};