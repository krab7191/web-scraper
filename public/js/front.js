
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
        data: {
            keyword: keyword
        },
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
        const comments = $(targ).parent("div.article").children("div.comments.hidden").clone();
        const id = $(targ).parent("div.article").attr("id");
        toggleModal(comments, id);
    }
    else {
        console.log(targ);
        const comments = $(targ).children("div.comments.hidden").clone();
        const id = $(targ).attr("id");
        toggleModal(comments, id);
    }
});

function toggleModal(commentArr, id) {
    let $mod = $("#modal");
    if ($mod.hasClass("is-active")) {
        $mod.removeClass("is-active");
    }
    else {
        appendComments(commentArr, id);
        $mod.addClass("is-active");
    }
}

function appendComments(arr, articleId) {
    let $mod = $("#media-content");
    $mod.empty();
    for (let i = 0; i < arr.length; i++) {
        $mod.append($(arr[i]).removeClass("hidden"));
    }
    $mod.append($("<hr>")).append($("<p>").html("Comment on this article:")).append($("<p>").addClass("hidden").attr("id", "artId").attr("data-id", articleId)).append($("<input>").attr("type", "text").attr("placeholder", "Your name").attr("id", "cmmt-name")).append($("<textarea>").attr("id", "commentBody")).append($("<button>").html("Submit").addClass("button").attr("id", "addComment"));
}

$(document).on("click", "#addComment", e => {
    const comment = {
        author: $("#cmmt-name").val().trim(),
        body: $("#commentBody").val().trim(),
        date: new Date()
    };
    const articleId = $("#artId").attr("data-id");
    addComment(comment, articleId);
});

$(".modal-background").on("click", () => {
    toggleModal();
});

function addComment(cmmtObj, id) {
    $.post({
        url: "/comment/" + id,
        data: cmmtObj
    }, resp => {
        console.log(resp);
        window.location.replace(resp);
    });
}