/// <reference path="SignalRService.ts"/>

module SmsApp {
    export class OutboundService {
        private connectionStatus: (status: string) => void = null;
        private outboundHub: IOutboundHub;

        constructor(private $http: ng.IHttpService, $location: ng.ILocationService, $rootScope: ng.IRootScopeService, signalRService: SignalRService) {
            this.outboundHub = signalRService.outboundHub;

            signalRService.outboundHub.client.updateStatus = (status) => this.connectionStatus(status);
            signalRService.outboundHub.client.messageDelivered = this.messageDelivered;
        }

        sendMessage(originator: string, receipient: string, message: string) {
            this.outboundHub.server.sendMessage(originator, receipient, message)
                .then(messageId => console.log(messageId));
        }

        onStatusUpdate(callback: (status: string) => void) {
            this.connectionStatus = callback;
        }

        messageDelivered(mesage) {

        }

        
    }
    smsApp.service('outboundService', ['$http', '$location', '$rootScope', 'signalRService', OutboundService]);
}