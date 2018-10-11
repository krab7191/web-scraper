
// On page load, scrape
$(() => {
    // getAllArticles();
    bindFilter();
});

function getAllArticles() {
    $.get({
        url: "/articles"
    }, data => {
        console.log(data);
        if (data.message === "Scrape complete") {
            location.reload();
        }
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

function filter(allowEmpty) {
    console.log("Filtering");
    let keyword = $("#keyword").val().trim();
    console.log(keyword);
    if (keyword.length !== 0 || allowEmpty) {
        $.post({
            data: { "keyword": keyword },
            url: "/filter"
        }, data => {
            window.location.replace(data);
        });
    }
}

function bindFilter() {
    $("#filter").on("click", e => {
        e.preventDefault();
        filter(false);
    });
    $("#clear").on("click", e => {
        e.preventDefault();
        $("#keyword").val("");
        filter(true);
    })
}

