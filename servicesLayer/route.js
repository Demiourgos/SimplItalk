var morgan = require('morgan');
var twilioClient = require('./TwilioApi/Client');
var bodyParser = require('body-parser');
var userHub = require('./hub/UserHub');
var _ = require('underscore');
var customerRequesetHub = [];
var supportUserId = 'vignesh';

module.exports = function(app){
	app.use(morgan('combined'));
    app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.all('/', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		next();
	});

	app.post('/customer/login', function(req, res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		var userId 		= req.body.username.toLowerCase(),
			password 	= req.body.password,
			userObj 	= userHub[userId];
		console.log('login requested by ', userId, password, userObj);
		if(userObj && userObj.password == password){
			var sessionId = new Date().valueOf();
			res.send(200, {
				sessionId: sessionId,
				products: userObj.products
			});
		} else {
			res.send(401);
		}		
	});


	app.post('/simplitalk', function(req, res) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		var userId = req.body.username.toLowerCase(),
			requestId = new Date().valueOf();
		customerRequesetHub.push({
			customerInfo: {
				'id'		: userHub[userId].id,
				'name'		: userHub[userId].name,
				'number'	: userHub[userId].number,
				'accountNo'	: '230418820231',
				'productName':"Savings Account",
    			'balance': '4562.56'
			},
			selectedProduct: req.body.selectedProduct,
			language: req.body.language,
			requestId: requestId,
			status: 0
		});
		console.log('============================================================================================================================');
		console.log('CUSTOMER REQUEST ', customerRequesetHub[customerRequesetHub.length - 1]);
		console.log('customer service requested by '+ userId +', requestId : ' + requestId + '. Queue Length : customerRequesetHub.queueLength');
		console.log('============================================================================================================================');
		res.send({
			queueLength: _.filter(customerRequesetHub, function(a){return a.status == 0;}).length,
			requestId: requestId
		});
	});

	app.get('/requestPoller', function(req, res) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		//check if the user has any ongoing status
		var newReq;
		if(_.every(customerRequesetHub, function(a){return a.status !== 1;})){
			newReq = _.find(customerRequesetHub, function(a){return a.status == 0;})
		}
		if(newReq){newReq.status = 1;}
		res.send(200, {
			requests: customerRequesetHub,
			newRequest: newReq
		});
	})


	app.post('/call', function(req, res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		var requestId = req.body.requestId;
		console.log('REQUEST ID ', requestId);
		var requestToProcess = _.find(customerRequesetHub, function(a){return a.requestId == requestId});
		var numberToCall = userHub[supportUserId].number;

		twilioClient.makeCall(numberToCall, function(err, call) {
			requestToProcess.sid = call.sid;
		});
		res.send(200, {requestId: requestId});
	});

	app.post('/trackcall', function(req, res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		var sid = req.body.CallSid;
		var requestToUpdate = _.find(customerRequesetHub, function(a){return a.sid == sid});
		console.log("++++++++++++++++++++++++++++++++++++++++++++")
		console.log("Call SID : ", sid);
		if(requestToUpdate){
			requestToUpdate.CallStatus = req.body.CallStatus;
			if(req.body.CallStatus == 'completed'){
				console.log("Updated to complete!!!");
				requestToUpdate.status = 3;
			}
		}
		console.log('Tracking call =====> ', req.body.CallStatus);

	});

	app.post('/callinprogress', function(req, res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		var sid = req.body.CallSid;
		var requestToUpdate = _.find(customerRequesetHub, function(a){return a.sid == sid});
		res.writeHead(200, {'Content-Type': 'text/xml'});
		res.end(twilioClient.connectCustomer(requestToUpdate.customerInfo.number));
		requestToUpdate.status = 2;
	});

	app.post('/dialCallStatus', function(req, res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		var sid = req.body.CallSid;
		var requestToUpdate = _.find(customerRequesetHub, function(a){return a.sid == sid});
		if(requestToUpdate){
			requestToUpdate.CallStatus = req.body.DialCallStatus;
			if(requestToUpdate.CallStatus == 'completed'){
				console.log("Updated to complete!!!");
				requestToUpdate.status = 3;
			}
		}
		console.log('Dialled call status =====> ', req.body.DialCallStatus);
	});


	app.post('/queuePoller', function(req, res) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		var requestId = req.body.requestId;
		var requestToProcess = _.find(customerRequesetHub, function(a){return a.requestId == requestId});
		var customerStatus = {queueLength: 0};
		if(requestToProcess){
			if(requestToProcess.status == 0){
				customerStatus.message = "Queued up";
				customerStatus.queueLength = _.filter(customerRequesetHub, function(a){return a.status == 0;}).indexOf(requestToProcess) + 1;
			} else if(requestToProcess.status == 1){
				customerStatus.message = "Will be shortly attended by customer care executive."
			} else if(requestToProcess.status == 2){
				customerStatus.message = "You will receive a call shortly."
			} else if(requestToProcess.status == 3){
				customerStatus.message = "Call completed. Please leave your feedback."
			}
		}
		if(requestToProcess && requestToProcess.CallStatus == 'ringing'){
			requestToProcess.CallStatus = "dialing";
		}

		res.send(200, {
			customerStatus: customerStatus,
			supportStatus: (requestToProcess || {}).CallStatus
		});
	});

	app.get('/resetStatus', function(req, res) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		customerRequesetHub.forEach(function(a) {
			if(a.status == 1){
				a.status = 0;
			}
		});
		res.end('status resetted');
	});

	app.get('/hardResetStatus', function(req, res) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		customerRequesetHub.forEach(function(a) {
			a.status = 0;
		});
		res.end('status resetted');
	});

};