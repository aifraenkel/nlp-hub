var curl = require('curlrequest');
module.exports = {
    _rasa: function _rasa(app, utterance, callback) {
        var appType = app.type;
        var options = {
            url: app.host+':'+app.Port+app.path,
            method: 'POST',
            headers: {
                 'Content-Type': 'application/json'
               },
            data: JSON.stringify({"q": utterance })
          };

        curl.request(options,function(err,data){
            if (err !== null) {
                //#TODO Chatch to error ...
                console.log('problem with request: ' + err);
                //callback();
            }
            var rasaResponse = JSON.parse(data.toString());
            let intent = {};
            intent.name = rasaResponse.topScoringIntent.intent;
            intent.score = rasaResponse.topScoringIntent.score;

            var myResponse = {};
            myResponse.engine = 'rasa';
            myResponse.intent = intent;
            myResponse.originalResponse = rasaResponse;
            
            myResponse.entities = [];
            rasaResponse.entities.forEach(function(e, i) {
                let entity = {};
                entity.value = e.entity;
                entity.type = e.type;
                entity.score = e.score;
                
                myResponse.entities[i] = entity;
            }, this);
            callback(myResponse);
        });
    }
}