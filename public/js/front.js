
// On page load...
$(() => {
    // getAllArticles();
    bindFilter();
    $("#keyword").focus();
});

$("#scrape").on("click", e => {
    e.preventDefault();
    let keyword = $("#keyword").val().trim();
    scrape(keyword);
});

function scrape(keyword) {
    $("#scrape").html("Fetching...");
    console.log(`Scraping with: ${keyword}`);
    $.post({
        keyword: keyword+"",
        url: "/scrape"
    }, data => {
        $("#scrape").html("Done!");
        console.log(data);
        setTimeout(() => {
            $("#scrape").html("Get latest news");
            window.location.replace(data);
        }, 2000);
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

$(".article").on("click", e => {
    const targ = e.target;
    const elemType = $(targ).prop("nodeName");
    if (elemType !== "DIV") {
        const comments = $(targ).parent("div.article").children("div.comments.hidden");
        toggleModal(comments);
    }
    else {
        const comments = $(targ).children("div.comments.hidden");
        toggleModal(comments);
    }
});

function toggleModal(commentArr) {
    let $mod = $("#modal");
    if ($mod.hasClass("is-active")) {
        $mod.removeClass("is-active");
    }
    else {
        appendComments(commentArr);
        $mod.addClass("is-active");
    }
}

function appendComments(arr) {
    console.log(arr);
    let $mod = $("#media-content");
    $mod.empty();
    for (let i = 0; i < arr.length; i++) {
        $mod.append($(arr[i]).removeClass("hidden"));
    }
    $mod.append($("<hr>")).append($("<p>").html("Comment on this article:")).append($("<textarea>")).append($("<button>").html("Submit").addClass("button"));
}

$(".modal-background").on("click", () => {
    toggleModal();
});

