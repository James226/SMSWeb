/// <reference path="SignalRService.ts"/>

module SmsApp {
    export class Notification {
        title: string;
        status: string;
    }
    export class NotificationService {
        notifications: Notification[];
        open: boolean;

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
    }

    export class OutboundService {
        private connectionStatus: (status: string) => void = null;
        private outboundHub: IOutboundHub;

        constructor(signalRService: SignalRService, private notifications: NotificationService) {
            this.outboundHub = signalRService.outboundHub;

            signalRService.outboundHub.client.updateStatus = (status) => this.connectionStatus(status);
            signalRService.outboundHub.client.messageDelivered = this.messageDelivered;
        }

        sendMessage(originator: string, receipient: string, message: string) {
            this.outboundHub.server.sendMessage(originator, receipient, message)
                .then(messageId => {
                    console.log(messageId);
                    this.notifications.notifications.push({ title: originator + " -> " + receipient, status: "Submitted" });
                });

            
        }

        onStatusUpdate(callback: (status: string) => void) {
            this.connectionStatus = callback;
        }

        messageDelivered(mesage) {

        }

        
    }
    smsApp.service('notificationService', [NotificationService]);
    smsApp.service('outboundService', ['signalRService', 'notificationService', OutboundService]);
}