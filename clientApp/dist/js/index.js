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
  $scope.selectedVals = {
    selectedLang:"",
    setSelectedProduct:""
  };

  $scope.message = "Angular is working";

  $scope.products = [
    {productName:"Savings Account"},
    {productName:"DepositAccounts"},
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

  $scope.gotoCallPage = function(){
    NavigationController.gotoStep(5);
  };

  $scope.setSelectedLanguage = function(language){
    console.log('language selected is ',language);
    $scope.selectedVals.selectedLang = language;
  };

  $scope.setSelectedProduct = function(product){
    console.log('product selected is ',product);
    $scope.selectedVals.setSelectedProduct = product;
  };



});




var LoginPage = (function(){
  var init = function(){
    NavigationController.showCurrentStep();
    $('#loginbtn').on('click',function(){


      /*$.ajax({
          type: "POST",
          url: 'http://65c603bb.ngrok.io/customer/login',
          data: {'username':'test'},
          success: function(){ debugger; },
          dataType: 'json'
        });*/

      NavigationController.goNext();
    }.bind(this));



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
