/// <reference path="../SmsApp.ts"/>

interface SignalR {
    inboxHub: SmsApp.IInboxHub;
    outboundHub: SmsApp.IOutboundHub;
}

module SmsApp {
    export interface IInboxHub extends HubConnection {
        client: {
            doStuff: () => void
            messageReceived: (inboundMessage: IInboundMessage) => void
        }

        server: {
            send: (message: string) => void
        }
    }
    export interface IOutboundHub extends HubConnection {
        client: {
            updateStatus: (status: string) => void
        }

        server: {
            setMode: (mode: number, username: string, password: string) => void
        }
    }

    export class InboxService {
        private inboxPromise: any;
        private messages: any;
        private connectionStatus: (status: string) => void = null;

        constructor(private $http: ng.IHttpService, $location: ng.ILocationService, $rootScope: ng.IRootScopeService) {
            var inboxHub = $.connection.inboxHub;
            var self = this;
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

            $.connection.outboundHub.client.updateStatus = (status) => self.connectionStatus(status);

            $.connection.hub.start().done(() => {
                if ($location.path() != "/login")
                    $.connection.outboundHub.server.setMode(1, "james.parker", "Esendex321");
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

        onStatusUpdate(callback: (status: string) => void) {
            this.connectionStatus = callback;
        }
    }
    smsApp.service('inboxService', InboxService);
}