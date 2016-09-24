var serviceUrl = "http://b8fdfcb4.ap.ngrok.io/";

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
    username:'hari',
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

  $scope.isCallCompleted = false;

  $scope.customerCallMessage = "Your call has been placed successfully !!";

  $scope.gotoQuestionPage = function(){
    NavigationController.gotoStep(3);
  };

  $scope.gotoProductQueryPage = function(){
    NavigationController.gotoStep(4);
  };

  var isServiceCalled = false;

  $scope.postToService = function(callback){
    isServiceCalled = true;
    $.ajax({
        type: "POST",
        url: serviceUrl + 'simplitalk',
        data: {
          username:$scope.user.username.toLowerCase(),
          language:$scope.selectedVals.selectedLang,
          selectedProduct:$scope.selectedVals.selectedProduct
        },
        success: function(data){
          isServiceCalled = false;
           callback(data);
         },
        dataType: 'json'
      });
  };

  $scope.gotoCallPage = function(){
    if(isServiceCalled){
      return;
    }

    $scope.postToService(function(data){
      console.log('Got request Id ',data.requestId);
      console.log('Got User name ',data.queueLength);
      $scope.noOfCustomersInQueue = data.queueLength;

      $scope.secondaryMessage = "No of Customers in Queue  - "+$scope.noOfCustomersInQueue;
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

          if(res.supportStatus == 'completed'){
              console.log('Status ',res.supportStatus);
              $scope.isCallCompleted = true;

              clearTimeout(handle);
          }
          else{
            setTimeout(pollFunction,1000);
          }
          $scope.$digest();
        }
      });
    };

    var handle = setTimeout(pollFunction,1000);
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
        data: {'username': $scope.user.username.toLowerCase(),'password':$scope.user.password},
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
    window.scrollTo(0,1);



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
