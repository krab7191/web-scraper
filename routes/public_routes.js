
const express = require("express"),
    control = require("../controllers/control_functions");

// Use router
const router = express.Router();

// Keyword used for filtering
let keyword = "";

// -- ROUTES -- //

// Post request with user's desired topic to look for when scraping
router.post("/filter", function (req, res) {
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


module.exports = router;