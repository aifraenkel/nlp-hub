var async = require('async');
var fs = require('fs');
var luis = require('./engines/luis.js');
var regex = require('./engines/regex.js');
var qnaMaker = require('./engines/qnamaker.js');
var rasa = require('./engines/rasa.js');
var image = require('./engines/image.js')

// This is a default value
var threshold = 0.8;

// Keep in memory the list of nlp apps.
var apps = {};

module.exports = {

    firstMatch: function (utterance, callback) {
        var returnValue = null;
        
        async.eachSeries(apps, function (app, callback) {
            process(app, utterance, function (response) {
                if (response.intent.score > threshold) {
                    returnValue = response;
                    callback('break'); // this means break
                }
                else {
                    callback(null); // this means continue
                }
            });
        }, function done() {
            callback(returnValue);
        });
    },
    
    bestMatch: function (utterance, callback) {
        var results = [];

        async.each(apps, function (app, callback) {
            process(app, utterance, function (response) {
                results.push(response);
                callback(null);
            });
        }, function done() {
            var bestResult = null;
            async.eachSeries(results, function (r, callback) {
                if (bestResult == null || r.intent.score > bestResult.intent.score) {
                    bestResult = r;
                }
                callback(null); // this means continue
            }, function done() {
                callback(bestResult);
            })
        });
    },
    
    useLuis: function (utterance,callback){
        var returnValue = null;
        //#TODO: Arreglar Esta cosa horrinble
        app = {"type":"luis", "id":"1319a65b-2ba6-4424-9b1d-f2917deb5707", "key":"e95f2ff9cab64606ae46acbc19550f90", "host":"eastus2.api.cognitive.microsoft.com","staging":"true"}; 
        process(app, utterance, function (response) {
            if (response.intent.score > threshold) {
                returnValue = response;
                callback(returnValue); // this means break
            }
            else {
                callback(null); // this means continue
            }
        }), function done() {
        callback(returnValue);
        };

    },
    average: function (utterance) {
        // to-do
    },

    regressionMatch: function (utterance) {
        // to-do
    },

    load: function (filePath) {
        var definition = JSON.parse(fs.readFileSync(`${filePath}`, 'utf8'));
        if (definition.threshold)
            threshold = definition.threshold;

        if (definition.apps)
            apps = definition.apps;
    }
}

function process(app, utterance, callback) {
    // to-do: switch-case according to engine. only for LUIS for now..
    if (app.type == 'luis')
        luis._luis(app.id, app.key, app.host, app.staging, utterance.text, callback, function (r) {
            callback(r);
        });
    if (app.type == 'regex')
        regex._regex(app, utterance.text, callback, function (r) {
            callback(r);
        })
    if (app.type == 'qnamaker')
        qnaMaker._qnaMaker(app, utterance.text, callback, function (r) {
            callback(r);
        })
    if (app.type == 'rasa')
        rasa._rasa(app, utterance.text, callback, function (r) {
            callback(r);
        })
    if (app.type == 'image')
        image._image(app, utterance, callback, function (r) {
            callback(r);
        })
    
    else
        return null; // return default: this line breaks
}