/// <reference path="../SmsApp.ts"/>

module SmsApp {
    export class InboxService {
        private inboxPromise: any;
        private messages: any;
        private connectionStatus: (status: Text) => void = null;

        constructor(private $http: ng.IHttpService, $location: ng.ILocationService, $rootScope: ng.IRootScopeService) {
            var inboxHub = $.connection.inboxHub;
            var self = this
            inboxHub.client.messageReceived = (inboundMessage: IInboundMessage) => {
                if (this.messages != null) {
                    this.messages.push({
                        Id: inboundMessage.MessageId,
                        Reference: inboundMessage.AccountId,
                        ReceivedAt: new Date().toISOString(),
                        To: { PhoneNumber: inboundMessage.To },
                        From: { PhoneNumber: inboundMessage.From },
                        Direction: "Inbound",
                        Summary: inboundMessage.MessageText
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

            $.connection.outboundHub.client.updateStatus = function (status: string) {
                self.connectionStatus(status);
            }

            $.connection.hub.start().done(() => {
                inboxHub.server.send("Test");
                $.connection.outboundHub.server.setMode(1, "", "");
            });


            function displayNotification(inboundMessage: IInboundMessage) {
                var notification = new window.Notification("New Message Received", {
                    body: inboundMessage.MessageText,
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
                    .then(data => this.messages = data.data)
                    .then(() => this.messages);
            }
            return this.inboxPromise;
        }

        onStatusUpdate(callback: (status: Text) => void) {
            this.connectionStatus = callback;
        }
    }
    smsApp.service('inboxService', InboxService);
}