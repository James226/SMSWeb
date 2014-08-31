/// <reference path="SignalRService.ts"/>

module SmsApp {
    export class Notification {
        id: string;
        originator: string;
        recipient: string;
        status: string;
        progress: number;

        constructor(id, originator, recipient, status, progress) {
            this.id = id;
            this.originator = originator;
            this.recipient = recipient;
            this.status = status;
            this.progress = progress;
        }

        getNotificationClass() {
            switch (this.status) {
                case 'Accepted':
                case 'Delivered':
                    return 'progress-bar-success';

                case 'Submitted':
                    return 'progress-bar-info';

                default:
                    return 'progress-bar-danger';
            }
        }
    }
    export class NotificationService {
        notifications: Notification[];
        open: boolean;

        notificationPulse: () => void;

        constructor() {
            this.open = false;
            this.notifications = [];
        }

        toggle() {
            this.open = !this.open;
        }

        hasNotifications() {
            return this.notifications.length > 0;
        }

        addNotification(notification: Notification) {
            for (var i in this.notifications) {
                if (this.notifications[i].id.indexOf(notification.id) !== -1) {
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
        }

        removeNotification(notification: Notification) {
            var index = this.notifications.indexOf(notification);
            if (index != -1)
                this.notifications.splice(index, 1);

            if (this.notifications.length == 0)
                this.open = false;
        }
    }

    export class OutboundService {
        private connectionStatus: (status: string) => void = null;
        private outboundHub: IOutboundHub;

        constructor(signalRService: SignalRService, private notifications: NotificationService) {
            this.outboundHub = signalRService.outboundHub;

            signalRService.outboundHub.client.updateStatus = (status) => this.connectionStatus(status);
            signalRService.outboundHub.client.messageSent = (message) => this.messageSent(message);
            signalRService.outboundHub.client.messageDelivered = (message) => this.messageDelivered(message);
        }

        sendMessage(originator: string, receipient: string, message: string) {
            this.outboundHub.server.sendMessage(originator, receipient, message)
                .then(messageId => {
                    console.log(messageId);
                    this.notifications.addNotification(new Notification(messageId, originator, receipient, "Submitted", 50));
                });            
        }

        onStatusUpdate(callback: (status: string) => void) {
            this.connectionStatus = callback;
        }

        messageSent(message) {
            this.notifications.addNotification(new Notification(message.MessageId, message.Originator, message.Recipient, "Sent", 50));
        }

        messageDelivered(message) {
            this.notifications.addNotification(new Notification(message.MessageId, message.Originator, message.Recipient, message.Status, 100));
        }        
    }
    smsApp.service('notificationService', [NotificationService]);
    smsApp.service('outboundService', ['signalRService', 'notificationService', OutboundService]);
}