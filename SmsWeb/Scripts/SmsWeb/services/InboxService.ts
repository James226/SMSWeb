/// <reference path="../SmsApp.ts"/>

module SmsApp {
    export class InboxService {
        private inboxPromise: any;
        private messages: any;

        constructor(private $http: ng.IHttpService, $location: ng.ILocationService, $rootScope: ng.IRootScopeService) {
            var inboxHub = $.connection.inboxHub;

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

            $.connection.outboundHub.client.go = (msg: string) => {
                // alert("Connected!");
            }

            $.connection.hub.start().done(() => {
                inboxHub.server.send("Test");
                $.connection.outboundHub.server.sendMessage("Test");
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
    }
    smsApp.service('inboxService', InboxService);
}