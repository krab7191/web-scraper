
// On page load, scrape
$(() => {
    // getAllArticles();
});

function getAllArticles() {
    $.get({
        url: "/articles"
    }, data => {
        location.reload();
    });
}

function scrape() {
    $.post({
        data: "test",
        url: "/scrape"
    }, data => {
        console.log(data);
        if (data.message === "ok") {
            location.reload();
        }
    });
}