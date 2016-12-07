$(document).ready(function() {

    var articleTitles = [];
    var articleLinks = [];
    var curIndex = 0;
    var clickCountNote = 0;

    $.get('/scrape', function() {
        return;
    });

    $('#date').html(moment().format('MMMM Do YYYY'));

    $('#next-article').on('click', function() {
        $('#article-title').empty();
        $('#article-link').empty();
        curIndex++;
        displayArticleTitle(articleTitles[curIndex]);
        displayArticleLink(articleLinks[curIndex]);
        if (curIndex >= articleTitles.length) {
            $('#article-title').html('No more articles!');
        }
        $('#save-note').remove();
        $('#delete-note').remove();
        $('#note-body-input').val("");
        clickCountNote = 0;
    });

    $('#prev-article').on('click', function() {
        if (curIndex == 0) {
            return;
        }
        $('#article-title').empty();
        $('#article-link').empty();
        curIndex--;
        displayArticleTitle(articleTitles[curIndex]);
        displayArticleLink(articleLinks[curIndex]);
        $('#save-note').remove();
        $('#delete-note').remove();
        $('#note-body-input').val("");
        clickCountNote = 0;
    });

    function displayArticleTitle(title) {
        $('#article-title').html(title);
    }

    function displayArticleLink(link) {
        $('#article-link').html(link);
    }

    $('#view-articles').on('click', function() {

        $.getJSON('/articles', function(data) {
            for (var i = 0; i < data.length; i++) {
                var p = $('<p data-id="' + data[i]._id + '">' + data[i].title + '</p>');
                articleTitles.push(p);
                var a = $('<a href="' + data[i].link + '" target="_blank">' + data[i].link + '</a>');
                articleLinks.push(a);
            }
            displayArticleTitle(articleTitles[curIndex]);
            displayArticleLink(articleLinks[curIndex]);
        });

        $(this).animate({
            opacity: 0
        }, 1000, function() {
            $(this).remove();
            $('#view-articles-button-container').remove();

            $('#front-page').fadeIn(2000).css('display', 'inline-block').removeClass('hidden');

            $('#note-header').fadeIn(2000).css('display', 'inline-block').removeClass('hidden');

            $('#note-display').fadeIn(2000).css('display', 'inline-block').removeClass('hidden');

            $('#next-article').fadeIn(2000).css('display', 'inline-block').removeClass('hidden');

            $('#prev-article').fadeIn(2000).css('display', 'inline-block').removeClass('hidden');

            // change these to use .show()
        });

    });

    // to add notes
    $('#article-title').on('click', 'p', function() {
        $('#note-body-input').empty();
        $('#save-note').remove();
        $('#delete-note').remove();
        var thisId = $(this).attr('data-id');

        $.ajax({
                method: 'GET',
                url: '/articles/' + thisId
            })
            .done(function(data) {
                if (clickCountNote != 0) {
                    return;
                } else {
                    $('#note-display').append('<div id="save-button-container"><button data-id="' + data._id + '" id="save-note">Save Note</button><button data-id="' + data._id + '" id="delete-note">Delete Note</button></div>');
                    $('#note-body-input').attr('disabled', false).focus();

                    if (data.note) {
                        $('#note-body-input').val(data.note.body);
                    }
                }
                clickCountNote++;
            });
    });

    $('#note-display').on('click', '#save-note', function() {
        $(this).remove();
        $('#delete-note').remove();
        $('#note-body-input').attr('disabled', true);
        var thisId = $(this).attr('data-id');
        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                body: $('#note-body-input').val()
            }
        })
        .done(function(data) {
            $('#note-body-input').val('Your note was successfully saved to the database!  You can check back later to remind yourself of the contents of your note.');
            clickCountNote = 0;
        });
    });

    $('#note-display').on('click', '#delete-note', function() {
        $(this).remove();
        $('#save-note').remove();
        $('#note-body-input').attr('disabled', true);
        var thisId = $(this).attr('data-id');
        $.ajax({
            method: "DELETE",
            url: "/articles/" + thisId
        })
        .done(function(data) {
            $('#note-body-input').val('The note was deleted from the database.');
            clickCountNote = 0;
        });
    });

    $('#note-body-input').blur(function() {
        $(this).attr('disabled', true);
        clickCountNote = 0;
    });
});