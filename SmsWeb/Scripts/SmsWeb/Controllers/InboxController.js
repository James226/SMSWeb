/// <reference path="../../typings/signalr/signalr.d.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../SmsApp.ts"/>
/// <reference path="../services/InboxService.ts"/>

var SmsApp;
(function (SmsApp) {
    var InboxController = (function () {
        function InboxController($scope, inbox) {
            inbox.getMessages().then(function (data) {
                console.log(data);
                $scope.messages = data.data;
            });

            $scope.transformDate = function (dateString) {
                return new Date(dateString.substring(0, dateString.indexOf('.')) + dateString.substring(dateString.length - 1)).toLocaleString();
            };

            var inboxHub = $.connection.inboxHub;

            inboxHub.client.doStuff = function () {
                console.log("Do Stuff!!");
            };

            $.connection.hub.start().done(function () {
                inboxHub.server.send("Test");
            });
        }
        return InboxController;
    })();

    SmsApp.smsApp.controller('inboxController', ['$scope', 'inboxService', InboxController]);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=InboxController.js.map
