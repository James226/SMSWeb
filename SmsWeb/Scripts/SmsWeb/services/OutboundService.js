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
        }
        OutboundService.prototype.sendMessage = function () {
            this.outboundHub.client.sendMessage();
        };

        OutboundService.prototype.onStatusUpdate = function (callback) {
            this.connectionStatus = callback;
        };
        return OutboundService;
    })();
    SmsApp.OutboundService = OutboundService;
    SmsApp.smsApp.service('outboundService', ['$http', '$location', '$rootScope', 'signalRService', OutboundService]);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=OutboundService.js.map
