var app = angular.module('buddyTransfer', ['ngMaterial', 'ngMdIcons', 'ngDroplet', 'ngDragDrop']);


app.controller('AppCtrl', ['$scope', '$mdBottomSheet','$mdSidenav', '$mdDialog', 'userService', function($scope, $mdBottomSheet, $mdSidenav, $mdDialog, userService){
  $scope.user = {
    name: 'Me'
  };

  $scope.friends = [ ];

  $scope.alert = '';

  $scope.logo = "send";

  /*
   *  PeerJS Connection
   */

  // sender peer, non mettendo l'id, lo genera automaticamente in maniera casuale (da peerjs server)
  var peer = new Peer({config: backupServersConfig, key: document.querySelector('body').getAttribute('data-key') });
  var senderId;

  peer.on('open', function(id) {

    senderId = id;

    peer.on('connection', function(conn) {


       conn.on('data', function(data) {

        if(data.id in toBeSent){
          toBeSent[data.id]();
        }
       });
    });
  });

  var toBeSent = {};
  
  $scope.addFriend = function(fileIndex, ev) {

    var gScope = $scope;

    var data = gScope.interface.getFiles(gScope.interface.FILE_TYPES.VALID)[fileIndex];

    function DialogController($scope, $mdDialog) {

      userService.getRandomURL(senderId).then(function( info ) {
          // get the url to paste
          $scope.newShareURL = document.location.protocol + '//' + document.location.hostname + (document.location.port ? ':'+document.location.port: '') + '/' + info.url;

          // get the peerId to listen
          toBeSent[info.peer] = setupNewDestination(info.peer, data.file, data.file.name);
      });

      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
    }

    function setupNewDestination(id, file, filename){
      
      function send(){
        var conn = peer.connect(id);
        
        conn.on('open', function() {
          conn.send({fileName: filename, file: file});
          
        });
      }
      return send;
    }

    $mdDialog.show({
      controller: DialogController,
      clickOutsideToClose: true,
      template: '<md-dialog aria-label="Share URL" flex="100">'+
                  '<md-content class="md-padding">'+
                  '<form name="shareForm">'+
                    '<md-input-container flex>'+
                    '<label>Copy URL</label>'+
                    '<md-progress-linear md-mode="indeterminate" ng-hide="newShareURL"></md-progress-linear>'+
                    '<textarea ng-model="newShareURL" columns="1"></textarea>'+
                    '</md-input-container>'+
                    '<p>Give it to a friend via email/Slack/messenger</p>'+
                    '</form>'+
                    '</md-content>'+
                    '<div class="md-actions" layout="row">'+
                    '<span flex></span>'+
                    '<md-button> Cancel </md-button>'+
                    '<md-button class="md-primary"> Ok </md-button>'+
                    '</div>'+
                    '</md-dialog>',
      targetEvent: ev
    })
    .then(function(answer) {
      $scope.newShareURL = null;
    });
  };

  $scope.setAbsolutePos = function(ev){
    // set the position of the moved element to absolute
    console.log(arguments);
  };

  $scope.setRelativePos = function(ev){
    // set the position of the moved element to absolute
  };

  setInterval(function(){
    if ($scope.logo === 'lock') {
        $scope.logo = 'send';
    } else {
        $scope.logo = 'lock';
    }
    $scope.$apply();
  }, 1500);

 /*
  * Managing droplet
  */
 $scope.interface = {};
 $scope.uploadCount = 0;
 $scope.success = false;
 $scope.error = false;



  $scope.$on('$dropletReady', function(){
    $scope.interface.allowedExtensions([/.+/]);
    $scope.interface.setRequestUrl('upload.html');
    $scope.interface.defineHTTPSuccess([/2.{2}/]);
    $scope.interface.useArray(false);
  });

  $scope.$on('$dropletSuccess', function onDropletSuccess(event, response, files) {
    $scope.uploadCount = files.length;
    // make a copy of the files for the rendering
    $scope.files = files
      .filter(function(file){
        return !$scope.filesId[file.id];
      })
      .map(function(file){
        return {id: file.id, name: file.name, size: file.size, targets: [] };
      });

    $scope.filesId = $scope.files.map(function(file){
      return file.id;
    });
  });

  $scope.$on('$dropletError', function onDropletError(event, response) {
    $scope.error = true;
    console.log(response);
  });

  // Get user profile info and his friends if available
  userService.getUser().then(function( user ) {
    $scope.user = user;
  });

  userService.getFriends().then(function( friends ) {
    $scope.friends = friends.sort(function(a,b){ return b.name > a.name; });
  });

}]);

  document.getElementById('dropzone').addEventListener("drag", function (e) {
    e.preventDefault();
  }, false);

  app.directive('userAvatar', function() {
    return {
      replace: true,
      template: '<svg class="user-avatar" viewBox="0 0 128 128" height="64" width="64" pointer-events="none" display="block" > <path fill="#FF8A80" d="M0 0h128v128H0z"/> <path fill="#FFE0B2" d="M36.3 94.8c6.4 7.3 16.2 12.1 27.3 12.4 10.7-.3 20.3-4.7 26.7-11.6l.2.1c-17-13.3-12.9-23.4-8.5-28.6 1.3-1.2 2.8-2.5 4.4-3.9l13.1-11c1.5-1.2 2.6-3 2.9-5.1.6-4.4-2.5-8.4-6.9-9.1-1.5-.2-3 0-4.3.6-.3-1.3-.4-2.7-1.6-3.5-1.4-.9-2.8-1.7-4.2-2.5-7.1-3.9-14.9-6.6-23-7.9-5.4-.9-11-1.2-16.1.7-3.3 1.2-6.1 3.2-8.7 5.6-1.3 1.2-2.5 2.4-3.7 3.7l-1.8 1.9c-.3.3-.5.6-.8.8-.1.1-.2 0-.4.2.1.2.1.5.1.6-1-.3-2.1-.4-3.2-.2-4.4.6-7.5 4.7-6.9 9.1.3 2.1 1.3 3.8 2.8 5.1l11 9.3c1.8 1.5 3.3 3.8 4.6 5.7 1.5 2.3 2.8 4.9 3.5 7.6 1.7 6.8-.8 13.4-5.4 18.4-.5.6-1.1 1-1.4 1.7-.2.6-.4 1.3-.6 2-.4 1.5-.5 3.1-.3 4.6.4 3.1 1.8 6.1 4.1 8.2 3.3 3 8 4 12.4 4.5 5.2.6 10.5.7 15.7.2 4.5-.4 9.1-1.2 13-3.4 5.6-3.1 9.6-8.9 10.5-15.2M76.4 46c.9 0 1.6.7 1.6 1.6 0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6-.1-.9.7-1.6 1.6-1.6zm-25.7 0c.9 0 1.6.7 1.6 1.6 0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6-.1-.9.7-1.6 1.6-1.6z"/> <path fill="#E0F7FA" d="M105.3 106.1c-.9-1.3-1.3-1.9-1.3-1.9l-.2-.3c-.6-.9-1.2-1.7-1.9-2.4-3.2-3.5-7.3-5.4-11.4-5.7 0 0 .1 0 .1.1l-.2-.1c-6.4 6.9-16 11.3-26.7 11.6-11.2-.3-21.1-5.1-27.5-12.6-.1.2-.2.4-.2.5-3.1.9-6 2.7-8.4 5.4l-.2.2s-.5.6-1.5 1.7c-.9 1.1-2.2 2.6-3.7 4.5-3.1 3.9-7.2 9.5-11.7 16.6-.9 1.4-1.7 2.8-2.6 4.3h109.6c-3.4-7.1-6.5-12.8-8.9-16.9-1.5-2.2-2.6-3.8-3.3-5z"/> <circle fill="#444" cx="76.3" cy="47.5" r="2"/> <circle fill="#444" cx="50.7" cy="47.6" r="2"/> <path fill="#444" d="M48.1 27.4c4.5 5.9 15.5 12.1 42.4 8.4-2.2-6.9-6.8-12.6-12.6-16.4C95.1 20.9 92 10 92 10c-1.4 5.5-11.1 4.4-11.1 4.4H62.1c-1.7-.1-3.4 0-5.2.3-12.8 1.8-22.6 11.1-25.7 22.9 10.6-1.9 15.3-7.6 16.9-10.2z"/> </svg>'
    };
  });

  app.service('userService', function($http, $q){
    return {
      getUser: getUser,
      getFriends: getFriends,
      getRandomURL: getRandomURL
    };

  function getRandomURL(senderId){
    var request = $http({
        method: "get",
        url: "/geturl",
        params: {id: senderId}
    });
    return request.then( handleSuccess, handleError ) ;
  }

  function getUser() {
      var request = $http({
          method: "get",
          url: "/me"
      });
      return request.then( handleSuccess, handleError ) ;
  }

  function getFriends() {
      var request = $http({
          method: "get",
          url: "/friends"
      });
      return request.then( handleSuccess, handleError ) ;
  }

  function handleError( response ) {
        if (! angular.isObject( response.data ) ||
            ! response.data.message) {
            return $q.reject( "An unknown error occurred." ) ;
        }
        // Otherwise, use expected error message.
        return $q.reject( response.data.message ) ;
    }
    // I transform the successful response, unwrapping the application data
    // from the API response payload.
    function handleSuccess( response ) {
        return response.data ;
    }
});

app.config(function($mdThemingProvider) {
  var customBlueMap =     $mdThemingProvider.extendPalette('light-blue', {
    'contrastDefaultColor': 'light',
    'contrastDarkColors': ['50'],
    '50': 'ffffff'
  });
  $mdThemingProvider.definePalette('customBlue', customBlueMap);
  $mdThemingProvider.theme('default')
    .primaryPalette('customBlue', {
      'default': '500',
      'hue-1': '50'
    })
    .accentPalette('pink');
  $mdThemingProvider.theme('input', 'default')
        .primaryPalette('grey');
});
