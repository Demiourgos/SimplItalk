var twilio = require('twilio');
var appConfig = require('../Config');

var client = twilio(appConfig.TWILIO.ACCOUNT_SID, appConfig.TWILIO.AUTH_TOKEN);

module.exports = {
	makeCall : function(numberToCall, callback){
		client.makeCall({
			to: numberToCall,
			from: appConfig.TWILIO.SUPPORT_NUMBER,
			url: appConfig.BASE_URL + "/callinprogress",
			statusCallback: appConfig.BASE_URL + "/trackcall",
		    statusCallbackMethod: "POST",
		    statusCallbackEvent: ["queued", "initiated", "ringing", "answered", "completed", "in-progress", "busy", "failed", "no-answer", "canceled"]
		}, callback);
	},
	connectCustomer: function(customerNumber) {
		var res = new twilio.TwimlResponse();
		res.say('Your will be shortly connected to the customer.',
		{
			voice:'woman',
			language:'en-gb'
		})
		.dial({
            action: appConfig.BASE_URL + "/dialCallStatus"
        }, customerNumber);
        return res.toString();
	}
}