var https = require('https');

module.exports = {
    
    _luis: function _luis(appId, appKey, appHost, staging, utterance, callback) {
        console.log("From Luis:");
        var options = {
            host: appHost,
            port: 443,
            path: `/luis/v2.0/apps/${appId}?subscription-key=${appKey}&timezoneOffset=0&verbose=true&staging=${staging}&q=${encodeURIComponent(utterance)}`,
            method: 'GET'
        };
            
        var req = https.request(options, function(res) {
            res.on('data', function (chunk) {
                var luisResponse = JSON.parse(chunk.toString());
                
                let intent = {};
                intent.name = luisResponse.topScoringIntent.intent;
                intent.score = luisResponse.topScoringIntent.score;
            
                var myResponse = {};
                myResponse.engine = 'luis';
                myResponse.intent = intent;
                myResponse.originalResponse = luisResponse;
            
                myResponse.entities = [];
                luisResponse.entities.forEach(function(e, i) {
                    let entity = {};
                    entity.value = e.entity;
                    entity.type = e.type;
                    entity.score = e.score;
            
                    myResponse.entities[i] = entity;
                }, this);
                callback(myResponse);
            });
        });
            
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
    
        // write data to request body
        req.write('data\n');
        req.write('data\n');
        req.end();
    }
}