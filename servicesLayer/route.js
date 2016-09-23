var morgan = require('morgan');
var twilioClient = require('./TwilioApi/Client');
var bodyParser = require('body-parser');

module.exports = function(app){
	app.use(morgan('combined'));
    app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.all('/', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		next();
	});

	app.get('/', function(req, res){
		res.end('Welcome!!!')
	});

	app.post('/customer/login', function(req, res){		
		console.log(req.body);
		res.send({
			sessionId: new Date().valueOf(),
			status: 'Log in successful'
		});
	});

	app.get('/call', function(req, res){
		var numberToCall = '+919894009336';
		twilioClient.makeCall(numberToCall, function() {		
			console.log('CALLBACK in create call!!!');
			console.log('==================================================================');
		});
		res.end('');
	});

	app.post('/trackcall', function(req, res){
		console.log('Tracking call =====> ', req.body.CallStatus);
	});

	app.post('/callinprogress', function(req, res){
		res.writeHead(200, {'Content-Type': 'text/xml'});
		res.end(twilioClient.connectCustomer('+919444674692'));
	});

	app.post('/dialCallStatus', function(req, res){
		console.log('Dialled call status =====> ', req.body.DialCallStatus);
	})
};