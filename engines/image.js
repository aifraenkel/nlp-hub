//here: to implement local regex processing

module.exports = {
    _image: function(app, utterance, callback) {
        var match = utterance.image;
        var r = imageResponse(app, match);
        callback(r);
    }
}

function imageResponse(app, match) {
    var r = {};
    r.engine = 'image';
    r.intent = {};
    r.intent.name = app.intent;
    r.intent.score = match != null ? 1 : 0;

    return r;
}