"use strict";

function bodyLoad() {
    document.getElementById('username-field').focus();
    document.getElementById('username-field').onkeypress = function(e) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13') {
            prepareToGetJSON();
            return false;
        }
    }
    $(document).keypress(function(e) {
        if (e.which == 13 && document.getElementById('username-field') != document.activeElement) {
            prepareToGetJSON();
        }
    });
}

function prepareToGetJSON() {
  document.getElementById('go-button').disabled = true;
  $("#main-table").fadeTo("fast", 0.0, function() {
      start();
  });
}

function start() {
    document.getElementById('main-table').innerHTML = "";

    var queryUsername = document.getElementById("username-field").value;
    var periodSelector = document.getElementById("period");
    var queryPeriod = periodSelector.options[periodSelector.selectedIndex].value;
    var contentSelector = document.getElementById("content");
    var selectedContent = contentSelector.options[contentSelector.selectedIndex].value;

    var queryURL = "";
    if (selectedContent == "albums") {
        queryURL = 'https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums'
    } else if (selectedContent == "tracks") {
        queryURL = 'https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks'
    } else {
        queryURL = 'https://ws.audioscrobbler.com/2.0/?method=user.gettopartists'
    }
    $.getJSON(queryURL + '&user=' + queryUsername + '&api_key=87ec32c9ada8828e6a86b70c7dbc2896&period=' + queryPeriod + '&format=json&limit=250', function(data) {
        didLoadData(data);
    });
}

function didLoadData(data) {
    loadAttributes(data);
    var objects;
    var isArtists = false;
    if (data.topalbums != null) {
        objects = data.topalbums.album;
    } else if (data.toptracks != null) {
        objects = data.toptracks.track;
    } else {
        objects = data.topartists.artist;
        isArtists = true;
    }
    var innerHTML = document.getElementById('main-table').innerHTML;
    for (var objectIndex in objects) {
        var object = objects[objectIndex];
        innerHTML = innerHTML + '<tr><td class="playcount">' + object.playcount + '</td>';
        innerHTML = innerHTML + '<td class="object-name"><a href="' + object.url + '" target="_blank">' + object.name + '</a></td>';
        if (!isArtists) {
            innerHTML = innerHTML + '<td>' + object.artist.name + '</td>';
        }
        innerHTML = innerHTML + '</tr>';
    }
    document.getElementById('main-table').innerHTML = innerHTML;
    $("#main-table").fadeTo("fast", 1.0, function() {
      document.getElementById('go-button').disabled = false;
    });
}

function loadAttributes(data) {
    var attributes;
    var contentType = "";
    if (data.topalbums != null) {
        attributes = data.topalbums["@attr"];
        contentType = "Album";
    } else if (data.toptracks != null) {
        attributes = data.toptracks["@attr"];
        contentType = "Track";
    } else {
        attributes = data.topartists["@attr"];
        contentType = "Artist";
    }
    if (contentType == "Artist") {
        document.getElementById('main-table').innerHTML = '<tr><th id="playcount-header">Plays</th><th>Artist</th></tr>';
    } else {
        document.getElementById('main-table').innerHTML = '<tr><th id="playcount-header">Plays</th><th>' + contentType + '</th><th>Artist</th></tr>';
    }
}
