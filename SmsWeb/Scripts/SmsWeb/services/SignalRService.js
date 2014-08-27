/// <reference path="../SmsApp.ts"/>
/// <reference path="../../typings/signalr/signalr.d.ts"/>
/// <reference path="../controllers/InboxController.ts"/>

var SmsApp;
(function (SmsApp) {
    var SignalRService = (function () {
        function SignalRService($location) {
            this.inboxHub = $.connection.inboxHub;
            this.outboundHub = $.connection.outboundHub;

            $.connection.hub.start().done(function () {
                if ($location.path() != "/login")
                    $.connection.outboundHub.server.setMode(1);
            });
        }
        return SignalRService;
    })();
    SmsApp.SignalRService = SignalRService;
    SmsApp.smsApp.service('signalRService', SignalRService);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=SignalRService.js.map
