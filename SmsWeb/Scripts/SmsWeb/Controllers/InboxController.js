/// <reference path="../../typings/signalr/signalr.d.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../SmsApp.ts"/>
/// <reference path="../services/InboxService.ts"/>

var SmsApp;
(function (SmsApp) {
    var InboxController = (function () {
        function InboxController($scope, $location, $rootScope, inbox) {
            inbox.getMessages().then(function (messages) {
                $scope.messages = messages;
            });

            $scope.transformDate = function (dateString) {
                return new Date(dateString.substring(0, dateString.indexOf('.')) + dateString.substring(dateString.length - 1)).toLocaleString();
            };
        }
        return InboxController;
    })();

    SmsApp.smsApp.controller('inboxController', ['$scope', '$location', '$rootScope', 'inboxService', InboxController]);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=InboxController.js.map
