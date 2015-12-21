import angular from 'angular';

angular.module('app.widgets.remote-html', [])
  .controller('RemoteHtmlWidgetController', function ($scope, APIProvider,
  											$translate,pageSubscriptions) {
    

    $scope.translate = $translate;
    $scope.visibility = true;
    
    function addListener(subscription) {
      var subscriptions = pageSubscriptions();
      for (var i in subscriptions) {
        if (subscriptions[i].emitter === subscription.emitter 
          && subscriptions[i].receiver === subscription.receiver) {
          return;
        }
      }
      subscriptions.push(subscription);
    };


    new APIProvider($scope)
      .config(() => {
      	// if($scope.widget.languageSelector){
      	// 	addListener({
       //          emitter:$scope.widget.languageSelector,
       //          receiver:  $scope.widget.instanceName,
       //          signal: "selectLanguage",
       //          slot: "selectLanguage"
       //      });
       //  }

        if($scope.widget.masterWidget){
      		addListener({
                emitter:$scope.widget.masterWidget,
                receiver:  $scope.widget.instanceName,
                signal: "slaveVisibility",
                slot: "slaveVisibility"
            });
        }	

        $translate($scope.widget.url).then((translation) => {$scope.url = translation})
      })
      .translate(() =>{
        // console.log("Transtate Remote HTML")
        $translate($scope.widget.url).then((translation) => {$scope.url = translation});
      })
      
      .provide("selectLanguage", (evt, value) => {
      	$translate($scope.widget.url).then((translation) => {$scope.url = translation})
      })
      .provide("slaveVisibility", (evt, value) => {
      	// console.log("slaveVisibility",evt, value)
      	$scope.visibility = value;
      });
  });
