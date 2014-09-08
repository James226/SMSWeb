/// <reference path="../SmsApp.ts"/>
/// <reference path="SignalRService.ts"/>

module SmsApp {
    class SmsMessage {
        MessageId: string;
        Originator: string;
        Recipient: string;
        Status: string;
        MessageReference: number;
        PartId: number;
        PartCount: number;
        Body: string;
    }

    export class InboxService {
        private inboxPromise: any;
        private messages: any;
        private connectionStatus: (status: string) => void = null;

        constructor(private $http: ng.IHttpService, $location: ng.ILocationService, $rootScope: ng.IRootScopeService, signalRService: SignalRService) {
            var inboxHub = signalRService.inboxHub;
            var outboundHub = signalRService.outboundHub;
            outboundHub.client.messageReceived = (inboundMessage: SmsMessage) => {
                if (typeof (this.messages) != "undefined") {
                    this.messages.push({
                        Id: inboundMessage.MessageId,
                        Reference: inboundMessage.Recipient,
                        ReceivedAt: new Date().toISOString(),
                        To: { PhoneNumber: inboundMessage.Recipient },
                        From: { PhoneNumber: inboundMessage.Originator },
                        Direction: "Inbound",
                        Summary: inboundMessage.Body
                    });
                    if (!$rootScope.$$phase) $rootScope.$apply();
                }

                if (window.Notification.permission !== "granted") {
                    if (window.Notification.permission !== 'denied') {
                        window.Notification.requestPermission(permission => {
                            if (!('permission' in window.Notification)) {
                                window.Notification.permission = permission;
                            }

                            if (permission === "granted") {
                                displayNotification(inboundMessage);
                            }
                        });
                    }
                } else {
                    if (window.Notification.permission === "granted") {
                        displayNotification(inboundMessage);
                    } else {
                        alert("A new message has been received");
                    }
                }
            };

            function displayNotification(inboundMessage: SmsMessage) {
                var notification = new window.Notification(inboundMessage.Originator, {
                    body: inboundMessage.Body,
                    icon: '/Content/mail.png'
                });
                notification.onclick = () => {
                    $location.path('/inbox');
                    if (!$rootScope.$$phase) $rootScope.$apply();
                }
            }
        }

        getMessages() {
            if (this.inboxPromise == null) {
                this.inboxPromise = this.$http
                    .get('Inbox/Messages')
                    .then(data => this.messages = (data.data == "" ? [] : data.data))
                    .then(() => this.messages);
            }
            return this.inboxPromise;
        }
    }
    smsApp.service('inboxService', ['$http', '$location', '$rootScope', 'signalRService', InboxService]);
}