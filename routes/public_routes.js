
const express = require("express"),
    control = require("../controllers/control_functions");

// Use router
const router = express.Router();

// Keyword used for filtering
let keyword = "";

// -- ROUTES -- //

// Post request with user's desired topic to look for when scraping
router.post("/filter", (req, res) => {
    keyword = req.body.keyword;
    console.log(keyword);
    res.json("/");
});

router.get("/", (req, res) => {
    control.getArticles(res, keyword);
});

router.get("/all", (req, res) => {
    control.jsonAll(res);
});

router.post("/scrape", (req, res) => {
    keyword = req.body.keyword;
    console.log(`Keyword is ${keyword}`);
    control.scrape({ link: "https://www.aljazeera.com" }, res, false, keyword);
});

router.post("/comment/:id", (req, res) => {
    control.addComment(req.body, req.params.id, res);
});


module.exports = router;