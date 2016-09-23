var currentRequest = "";

function CustomerSupport(){
	this.BASE_URL = "http://6a717c48.ngrok.io";
}

CustomerSupport.prototype.showModal = function(first_argument) {
	//alert("sdasd");
	$('#myModal').removeClass('hidden');
	$('#myModal').modal({
		width:"800px"
	})
};

CustomerSupport.prototype.fillModal = function(obj,newReq) {
	
	$("#cusID").val(obj.id);
	$("#cusName").val(obj.name);
	$("#accountID").val(obj.accountNo);
	$("#cusAccType").val(obj.productName);
	$("#cusAccBal").val(obj.balance);
	$("#selectedOption").html(newReq.selectedProduct+" - "+newReq.language);

}

CustomerSupport.prototype.frameTables = function(first_argument) {
	//alert("sdasd");
	
	$("#ordersTable , #transcationTable").DataTable({
      "paging": false,
      "lengthChange": false,
      "searching": false,
      "ordering": true,
      "info": true
	});
    

    $('#queuedlogs').DataTable({
      "paging": false,
      "lengthChange": false,
      "searching": false,
      "ordering": true,
      "info": true
    });

};

CustomerSupport.prototype.initCall = function() {

	var url = this.BASE_URL+"/call";
	

	$.ajax({ 
   		url: url, 
   		success: function(data) {
   	     	console.log(data);
   	     	$("#initCall").addClass("hidden");
   	     	CustomerSupportObj.requestCallStatus();
   		},
   		method: "POST",
   		data: {requestId: currentRequest.requestId},
   		dataType: "json"
   	});

}

CustomerSupport.prototype.requestCallStatus = function(data) {



	var url = this.BASE_URL+"/queuePoller";
	$("#callStatus").html("Processing...");

	setInterval(function() {
		$.ajax({ 
	   		url: url, 
	   		success: function(data) {
	   	     	console.log(data);
	   	     	$(".spinner").addClass("hidden");
	   	     	$("#callStatus").html(data.supportStatus);
	   		},
	   		method: "POST",
	   		data: {requestId: currentRequest.requestId},
	   		dataType: "json"
	   	});
   	}, 3000);

}

CustomerSupport.prototype.listenCustomers = function() {

	var url = this.BASE_URL+"/requestPoller";

	   setInterval(function() {
	       $.ajax(
	       	{ 
	       		url: url, 
	       		success: function(data) {
	       			
	       			if(data.newRequest) {

	       				currentRequest = data.newRequest;
	       				CustomerSupportObj.showModal();
	       				CustomerSupportObj.fillModal(data.newRequest.customerInfo,data.newRequest);

	       			}

	       	     	
	       		},
	       		method: "GET",
	       		dataType: "json"
	       	});
	    }, 5000);
	
	

}

var CustomerSupportObj = new CustomerSupport();

//CustomerSupportObj.frameTables();
CustomerSupportObj.listenCustomers();


$("#initCall").on("click",function(){
	$("#callStatus, .spinner").removeClass("hidden");
	 CustomerSupportObj.initCall();
})



