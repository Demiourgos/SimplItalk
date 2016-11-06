var currentRequest = "";
var listenCustpollInterval = "";
var queuePollerInterval= "";
var BASE_URL = "http://173.255.234.128:3000/";

function CustomerSupport(){

}

CustomerSupport.prototype.showModal = function(first_argument) {
	//alert("sdasd");
	$('#myModal').removeClass('hidden');
	$('#myModal').modal({
		width:"800px"
	});
};

CustomerSupport.prototype.hideModal = function(first_argument) {
	//alert("sdasd");
	$('#myModal').addClass('hidden');
	$('#myModal').modal('hide'); 
	
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

	var url = BASE_URL+"/call";
	

	$.ajax({ 
   		url: url, 
   		success: function(data) {

   	     	$("#initCall").addClass("hidden");
   	     	CustomerSupportObj.requestCallStatus();
   		},
   		method: "POST",
   		data: {requestId: currentRequest.requestId},
   		dataType: "json"
   	});

}

CustomerSupport.prototype.requestCallStatus = function(data) {

	var url = BASE_URL+"/queuePoller";

	$("#callStatus .StatusPart").html("Processing...");

	queuePollerInterval = setInterval(CustomerSupportObj.queuePollerAjaxCall, 3000);
	

}

CustomerSupport.prototype.queuePollerAjaxCall = function() {

	var url = BASE_URL+"/queuePoller";

	$.ajax({ 
	   		url: url, 
	   		success: function(data) {
	   	     	
	   	     	$(".spinner").addClass("hidden");

	   	     	$("#callStatus .StatusPart").html(data.supportStatus);

	   	     	if(data.supportStatus == "completed") {

	   	     		$("#callStatus .StatusPart").html("");
	   	     		CustomerSupportObj.hideModal();
	   	     		$(".spinner, #initCall").removeClass("hidden");
	   	     		clearInterval(queuePollerInterval);
	   	     		CustomerSupportObj.listenCustomers();

	   	     	}

	   		},
	   		method: "POST",
	   		data: {requestId: currentRequest.requestId},
	   		dataType: "json"
	});

}

CustomerSupport.prototype.listenCustomersAjaxCall = function() {

		   var url = BASE_URL+"/requestPoller";

	       $.ajax(
	       	{ 
	       		url: url, 
	       		success: function(data) {
	       			
	       			if(data.newRequest) {

	       				currentRequest = data.newRequest;
	       				CustomerSupportObj.showModal();
	       				$("#callStatus, .spinner").addClass("hidden");
	       				clearInterval(listenCustpollInterval);
	       				CustomerSupportObj.fillModal(data.newRequest.customerInfo,data.newRequest);

	       			}
	       	     	
	       		},
	       		method: "GET",
	       		dataType: "json"
	       	});
	   

}

CustomerSupport.prototype.listenCustomers = function() {

	   listenCustpollInterval = setInterval(CustomerSupportObj.listenCustomersAjaxCall, 5000);

}

var CustomerSupportObj = new CustomerSupport();

//CustomerSupportObj.frameTables();
CustomerSupportObj.listenCustomers();


$("#initCall").on("click",function(){
	$("#callStatus, .spinner").removeClass("hidden");
	 CustomerSupportObj.initCall();
})



