var serviceUrl = "http://6a717c48.ngrok.io/";

var NavigationController = (function(){
    var currentStep = 1;

    var showCurrentStep = function(){
      $('.page').hide();
      $('.page-'+currentStep).show();
    };

    var goNext = function(){
      currentStep++;
      this.showCurrentStep();
    };
    var goPrevious = function(){
      currentStep--;
      this.showCurrentStep();
    };

    var gotoStep = function(stepNo){
      currentStep = stepNo;
      showCurrentStep();
    };

    return {
      showCurrentStep :showCurrentStep,
      goNext          :goNext,
      goPrevious      :goPrevious,
      gotoStep        :gotoStep
    };
})();

angular.module('simplitalk',[]).
controller('pageonecontroller',function($scope){
  $scope.user = {
    username:'arun',
    password:"welcome123"
  };

  $scope.selectedVals = {
    selectedLang:"",
    selectedProduct:""
  };

  $scope.noOfCustomersInQueue = 0;

  $scope.products = [
    {
     productName:"Savings Account",
     accountNo:"",
     balance:""
    },
    {
      productName:"DepositAccounts",
      accountNo:""
    },
    {productName:"PPF Account"},
    {productName:"Current Accounts"},
    {productName:"Insurance"},
    {productName:"Loans"},
  ];

  $scope.languages = [
    {name:"English"},
    {name:"Hindi"},
    {name :"Tamil"}
  ];

  $scope.customerCallMessage = "Your call has been placed successfully !!";

  $scope.gotoQuestionPage = function(){
    NavigationController.gotoStep(3);
  };

  $scope.gotoProductQueryPage = function(){
    NavigationController.gotoStep(4);
  };

  $scope.postToService = function(callback){
    $.ajax({
        type: "POST",
        url: serviceUrl + 'simplitalk',
        data: {
          username:$scope.user.username,
          language:$scope.selectedVals.selectedLang,
          selectedProduct:$scope.selectedVals.selectedProduct
        },
        success: function(data){
           callback(data);
         },
        dataType: 'json'
      });
  };

  $scope.gotoCallPage = function(){
    $scope.postToService(function(data){
      console.log('Got request Id ',data.requestId);
      console.log('Got User name ',data.queueLength);
      $scope.noOfCustomersInQueue = data.queueLength;

      $scope.secondaryMessage = "No of Customers in Queue"+$scope.noOfCustomersInQueue;
      $scope.$digest();
      NavigationController.gotoStep(5);
      $scope.pollForCustomerSupportQueue(data.requestId);
    });
  };


  $scope.pollForCustomerSupportQueue = function(requestId){
    var pollFunction = function(){
       $.ajax({
        type: "POST",
        url: serviceUrl + 'queuePoller',
        data: {
          'requestId':requestId
        },
        success:function(res){
          console.log('response ',res);
          $scope.noOfCustomersInQueue = res.customerStatus.queueLength;

          if(res.customerStatus.queueLength == 0){
            $scope.secondaryMessage = res.customerStatus.message;
          }

          $scope.$digest();
          if(res.supportStatus == 'completed'){
              console.log('Status ',res.supportStatus);
              clearTimeout(handle);
          }
          else{

            setTimeout(pollFunction,4000);
          }
        }
      });
    };

    var handle = setTimeout(pollFunction,4000);
  };


  $scope.setSelectedLanguage = function(language){
    console.log('language selected is ',language);
    $scope.selectedVals.selectedLang = language;
  };

  $scope.setSelectedProduct = function(product){
    console.log('product selected is ',product);
    $scope.selectedVals.selectedProduct = product;
  };

  $scope.callCustomerSupport = function(){
    $scope.gotoCallPage();
  };

  $scope.login = function(){
    $.ajax({
        type: "POST",
        url: serviceUrl +'customer/login',
        data: {'username': $scope.user.username,'password':$scope.user.password},
        success: function(){
          NavigationController.goNext();
        },
        dataType: 'json'
      });

  };


});




var LoginPage = (function(){
  var init = function(){
    NavigationController.showCurrentStep();




  };
  return {
    init:init
  };
})();



(function(){

  console.log('Index js got executed now');
  $.material.init();
  LoginPage.init();

})();
