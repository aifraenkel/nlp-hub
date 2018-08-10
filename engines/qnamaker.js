var https = require('https');

module.exports = {
    _qnaMaker: function(app, utterance, callback) {

        var data = { question: utterance };
        var options = {
            host: app.host,
            port: 443,
            path: `/qnamaker/knowledgebases/${app.kb}/generateAnswer`,
            method: 'POST',
            headers: {
                'Authorization': `EndpointKey ${app.key}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(data))
            }
        };
        var req = https.request(options, function(res) {
            res.on('data', function(chunk) {
                var serviceResponse = JSON.parse(chunk.toString());
                // console.log(serviceResponse.answers);
                let intent = {};
                // intent.name = 'QnA-Answer';
                if (serviceResponse.answers != null && serviceResponse.answers.length > 0) {
                    intent.score = serviceResponse.answers[0].score; // highest-ranking score
                    intent.name = serviceResponse.answers[0].answer;
                } else {
                    intent.score = 0;
                }

                var myResponse = {};
                myResponse.engine = 'qnamaker';
                // myResponse.intent = serviceResponse.answers[0].answer;
                myResponse.intent = intent;
                myResponse.answer = serviceResponse.answer;

                myResponse.originalResponse = serviceResponse;
                // console.log(myResponse);
                callback(myResponse);
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        req.write(JSON.stringify(data));
        req.end();
    }
}