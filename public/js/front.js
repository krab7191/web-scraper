
// On page load...
$(() => {
    // getAllArticles();
    bindFilter();
    commentHandlers();
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
    $mod.append($("<hr>")).append($("<p>").html("Comment on this article:")).append($("<p>").addClass("hidden").attr("id", "artId").attr("data-id", articleId)).append($("<input>").addClass("input").attr("type", "text").attr("placeholder", "Your name").attr("id", "cmmt-name")).append($("<textarea>").addClass("textarea").attr("id", "commentBody").attr("wrap", "hard")).append($("<button>").html("Submit").addClass("button").attr("id", "addComment"));
}


function commentHandlers() {
    $(document).on("click", "#addComment", e => {
        turnOffCommentHandlers();
        const comment = {
            author: $("#cmmt-name").val().trim(),
            body: $("#commentBody").val().trim(),
            date: new Date()
        };
        const articleId = $("#artId").attr("data-id");
        addComment(comment, articleId);
    });
}

$(document).on("click", ".delete-button", e => {
    e.preventDefault();
    const id = $(e.target).attr("id");
    console.log(id);
    deleteComment(id);
})

function turnOffCommentHandlers() {
    $("#addComment").off("click");
}

$(".modal-background").on("click", () => {
    toggleModal();
});

function addComment(cmmtObj, id) {
    $.post({
        url: "/comment/" + id,
        data: cmmtObj
    }, resp => {
        window.location.replace(resp);
    });
}

function deleteComment(id) {
    console.log("firing del comment");
    $.get({
        url: "/delete/" + id
    }, resp => {
        window.location.replace(resp);
    });
}