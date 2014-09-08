/// <reference path="../SmsApp.ts"/>
/// <reference path="../../typings/signalr/signalr.d.ts"/>
/// <reference path="../controllers/InboxController.ts"/>

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
            messageSent: (message) => void
            messageDelivered: (message) => void
            messageReceived: (message) => void
        }

        server: {
            setMode: (mode: number) => void
            sendMessage: (originator: string, recipient: string, message: string) => any
        }
    }

    export class SignalRService {
        public inboxHub: IInboxHub;
        public outboundHub: IOutboundHub;

        constructor($location: ng.ILocationService) {
            this.inboxHub = $.connection.inboxHub;
            this.outboundHub = $.connection.outboundHub;

            $.connection.hub.start().done(() => {
                if ($location.path() != "/login")
                    $.connection.outboundHub.server.setMode(1);
            });
        }
    }
    smsApp.service('signalRService', SignalRService);
}