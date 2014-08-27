/// <reference path="SignalRService.ts"/>
var SmsApp;
(function (SmsApp) {
    var Notification = (function () {
        function Notification() {
        }
        return Notification;
    })();
    SmsApp.Notification = Notification;
    var NotificationService = (function () {
        function NotificationService() {
            this.open = false;
            this.notifications = [];
        }
        NotificationService.prototype.toggle = function () {
            this.open = !this.open;
        };

        NotificationService.prototype.hasNotifications = function () {
            return this.notifications.length > 0;
        };
        return NotificationService;
    })();
    SmsApp.NotificationService = NotificationService;

    var OutboundService = (function () {
        function OutboundService(signalRService, notifications) {
            var _this = this;
            this.notifications = notifications;
            this.connectionStatus = null;
            this.outboundHub = signalRService.outboundHub;

            signalRService.outboundHub.client.updateStatus = function (status) {
                return _this.connectionStatus(status);
            };
            signalRService.outboundHub.client.messageDelivered = this.messageDelivered;
        }
        OutboundService.prototype.sendMessage = function (originator, receipient, message) {
            var _this = this;
            this.outboundHub.server.sendMessage(originator, receipient, message).then(function (messageId) {
                console.log(messageId);
                _this.notifications.notifications.push({ title: originator + " -> " + receipient, status: "Submitted" });
            });
        };

        OutboundService.prototype.onStatusUpdate = function (callback) {
            this.connectionStatus = callback;
        };

        OutboundService.prototype.messageDelivered = function (mesage) {
        };
        return OutboundService;
    })();
    SmsApp.OutboundService = OutboundService;
    SmsApp.smsApp.service('notificationService', [NotificationService]);
    SmsApp.smsApp.service('outboundService', ['signalRService', 'notificationService', OutboundService]);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=OutboundService.js.map
