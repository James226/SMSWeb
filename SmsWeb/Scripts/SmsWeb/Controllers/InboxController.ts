/// <reference path="../../typings/signalr/signalr.d.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../SmsApp.ts"/>
/// <reference path="../services/InboxService.ts"/>

interface SignalR {
    inboxHub: SmsApp.IInboxHub;
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
        constructor($scope : IInboxScope, inbox : InboxService) {
            inbox.getMessages().then(data => {
                console.log(data);
                $scope.messages = data.data;
            });

            $scope.transformDate = dateString =>
                new Date(dateString.substring(0, dateString.indexOf('.')) + dateString.substring(dateString.length - 1)).toLocaleString();

            var inboxHub = $.connection.inboxHub;

            inboxHub.client.doStuff = () => {
                console.log("Do Stuff!!");
            };

            $.connection.hub.start().done(() => {
                inboxHub.server.send("Test");
            });
        }
    }

    smsApp.controller('inboxController', ['$scope', 'inboxService', InboxController]);
}