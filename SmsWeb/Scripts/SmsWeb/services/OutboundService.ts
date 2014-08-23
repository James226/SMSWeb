/// <reference path="SignalRService.ts"/>

module SmsApp {
    export class OutboundService {
        private connectionStatus: (status: string) => void = null;

        constructor(private $http: ng.IHttpService, $location: ng.ILocationService, $rootScope: ng.IRootScopeService, signalRService: SignalRService) {
            var outboundHub = signalRService.outboundHub;

            signalRService.outboundHub.client.updateStatus = (status) => this.connectionStatus(status);
        }

        onStatusUpdate(callback: (status: string) => void) {
            this.connectionStatus = callback;
        }
    }
    smsApp.service('outboundService', ['$http', '$location', '$rootScope', 'signalRService', OutboundService]);
}