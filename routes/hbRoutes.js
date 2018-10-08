
// Export my routes
module.exports = function (app) {

    app.get("/", function (req, res) {
        res.render("home", { message: "Hello world" });
    });

};