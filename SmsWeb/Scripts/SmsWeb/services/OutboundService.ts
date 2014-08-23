/// <reference path="SignalRService.ts"/>

module SmsApp {
    export class OutboundService {
        private connectionStatus: (status: string) => void = null;
        private outboundHub: IOutboundHub;

        constructor(private $http: ng.IHttpService, $location: ng.ILocationService, $rootScope: ng.IRootScopeService, signalRService: SignalRService) {
            this.outboundHub = signalRService.outboundHub;

            signalRService.outboundHub.client.updateStatus = (status) => this.connectionStatus(status);
        }

        sendMessage() {
            this.outboundHub.client.sendMessage("", "", "");
        }

        onStatusUpdate(callback: (status: string) => void) {
            this.connectionStatus = callback;
        }
    }
    smsApp.service('outboundService', ['$http', '$location', '$rootScope', 'signalRService', OutboundService]);
}