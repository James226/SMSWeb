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
        }
    }

    smsApp.controller('inboxController', ['$scope', '$location', '$rootScope', 'inboxService', InboxController]);
}