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

            var inboxHub = $.connection.inboxHub;

            inboxHub.client.doStuff = function () {
                if (window.Notification.permission !== "granted") {
                    if (window.Notification.permission !== 'denied') {
                        window.Notification.requestPermission(function (permission) {
                            // Whatever the user answers, we make sure we store the information
                            if (!('permission' in window.Notification)) {
                                window.Notification.permission = permission;
                            }

                            // If the user is okay, let's create a notification
                            if (permission === "granted") {
                                displayNotification();
                                return;
                            }
                        });
                    }
                } else {
                    if (window.Notification.permission === "granted") {
                        displayNotification();
                    } else {
                        alert("A new message has been received");
                    }
                }
            };

            $.connection.hub.start().done(function () {
                inboxHub.server.send("Test");
            });

            function displayNotification() {
                var notification = new window.Notification("New Message Received", {
                    body: 'Message Body....',
                    icon: '/Content/mail.png'
                });
                notification.onclick = function () {
                    $location.path('/inbox');
                    if (!$rootScope.$$phase)
                        $rootScope.$apply();
                };
            }
        }
        return InboxController;
    })();

    SmsApp.smsApp.controller('inboxController', ['$scope', '$location', '$rootScope', 'inboxService', InboxController]);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=InboxController.js.map
