/// <reference path="SignalRService.ts"/>
var SmsApp;
(function (SmsApp) {
    var OutboundService = (function () {
        function OutboundService($http, $location, $rootScope, signalRService) {
            var _this = this;
            this.$http = $http;
            this.connectionStatus = null;
            this.outboundHub = signalRService.outboundHub;

            signalRService.outboundHub.client.updateStatus = function (status) {
                return _this.connectionStatus(status);
            };
            signalRService.outboundHub.client.messageDelivered = this.messageDelivered;
        }
        OutboundService.prototype.sendMessage = function (originator, receipient, message) {
            this.outboundHub.client.sendMessage(originator, receipient, message);
        };

        OutboundService.prototype.onStatusUpdate = function (callback) {
            this.connectionStatus = callback;
        };

        OutboundService.prototype.messageDelivered = function (mesage) {
        };
        return OutboundService;
    })();
    SmsApp.OutboundService = OutboundService;
    SmsApp.smsApp.service('outboundService', ['$http', '$location', '$rootScope', 'signalRService', OutboundService]);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=OutboundService.js.map
