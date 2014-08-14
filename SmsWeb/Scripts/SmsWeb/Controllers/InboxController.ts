/// <reference path="../../typings/signalr/signalr.d.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../SmsApp.ts"/>
/// <reference path="../services/InboxService.ts"/>

interface SignalR {
    inboxHub: SmsApp.IInboxHub;
}

interface Window {
    Notification: any;
}

module SmsApp {
    export interface IInboxHub extends HubConnection {
        client: {
            doStuff: () => void
        }

        server: {
            send: (message: string) => void
        }
    }

    interface IInboxScope extends ng.IScope {
        messages: any;
        transformDate: (date: string) => string;
    }

    class InboxController {
        constructor($scope : IInboxScope, $location: ng.ILocationService, $rootScope: ng.IRootScopeService, inbox : InboxService) {
            inbox.getMessages().then(messages => {
                $scope.messages = messages;
            });

            $scope.transformDate = dateString =>
                new Date(dateString.substring(0, dateString.indexOf('.')) + dateString.substring(dateString.length - 1)).toLocaleString();

            var inboxHub = $.connection.inboxHub;

            inboxHub.client.doStuff = () => {
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

            $.connection.hub.start().done(() => {
                inboxHub.server.send("Test");
            });


            function displayNotification() {
                var notification = new window.Notification("New Message Received", {
                    body: 'Message Body....',
                    icon: '/Content/mail.png'
                });
                notification.onclick = () => {
                    $location.path('/inbox');
                    if (!$rootScope.$$phase) $rootScope.$apply();
                }
            }
        }
    }

    smsApp.controller('inboxController', ['$scope', '$location', '$rootScope', 'inboxService', InboxController]);
}