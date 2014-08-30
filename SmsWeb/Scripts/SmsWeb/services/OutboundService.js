/// <reference path="SignalRService.ts"/>
var SmsApp;
(function (SmsApp) {
    var Notification = (function () {
        function Notification(id, originator, recipient, status, progress) {
            this.id = id;
            this.originator = originator;
            this.recipient = recipient;
            this.status = status;
            this.progress = progress;
        }
        Notification.prototype.getNotificationClass = function () {
            switch (this.status) {
                case 'Accepted':
                case 'Delivered':
                    return 'progress-bar-success';

                case 'Submitted':
                    return 'progress-bar-info';

                default:
                    return 'progress-bar-danger';
            }
        };
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

        NotificationService.prototype.addNotification = function (notification) {
            for (var i in this.notifications) {
                if (this.notifications[i].id == notification.id) {
                    this.notifications[i].status = notification.status;
                    this.notifications[i].progress = notification.progress;
                    if (typeof (this.notificationPulse) !== 'undefined')
                        this.notificationPulse();
                    return;
                }
            }
            this.notifications.push(notification);
            if (typeof (this.notificationPulse) !== 'undefined')
                this.notificationPulse();
        };

        NotificationService.prototype.removeNotification = function (notification) {
            var index = this.notifications.indexOf(notification);
            if (index != -1)
                this.notifications.splice(index, 1);

            if (this.notifications.length == 0)
                this.open = false;
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
            signalRService.outboundHub.client.messageSent = function (message) {
                return _this.messageSent(message);
            };
            signalRService.outboundHub.client.messageDelivered = function (message) {
                return _this.messageDelivered(message);
            };
        }
        OutboundService.prototype.sendMessage = function (originator, receipient, message) {
            var _this = this;
            this.outboundHub.server.sendMessage(originator, receipient, message).then(function (messageId) {
                console.log(messageId);
                _this.notifications.addNotification(new Notification(messageId, originator, receipient, "Submitted", 50));
            });
        };

        OutboundService.prototype.onStatusUpdate = function (callback) {
            this.connectionStatus = callback;
        };

        OutboundService.prototype.messageSent = function (message) {
            this.notifications.addNotification(new Notification(message.MessageId, message.Originator, message.Recipient, "Sent", 50));
        };

        OutboundService.prototype.messageDelivered = function (message) {
            this.notifications.addNotification(new Notification(message.MessageId, message.Originator, message.Recipient, message.Status, 100));
        };
        return OutboundService;
    })();
    SmsApp.OutboundService = OutboundService;
    SmsApp.smsApp.service('notificationService', [NotificationService]);
    SmsApp.smsApp.service('outboundService', ['signalRService', 'notificationService', OutboundService]);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=OutboundService.js.map
