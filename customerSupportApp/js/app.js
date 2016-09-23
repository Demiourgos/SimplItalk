function CustomerSupport(){

}

CustomerSupport.prototype.showModal = function(first_argument) {
	//alert("sdasd");
	$('#myModal').modal({
		width:"800px"
	})
};

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

CustomerSupport.prototype.listenCustomers = function(first_argument) {

	var source = new EventSource("demo_sse.php");
	
	source.onmessage = function(event) {
	    document.getElementById("result").innerHTML += event.data + "<br>";
	};

}


var CustomerSupportObj = new CustomerSupport();
CustomerSupportObj.showModal();
//CustomerSupportObj.frameTables();
CustomerSupportObj.listenCustomers();
