/// <reference path="../SmsApp.ts"/>
/// <reference path="SignalRService.ts"/>
var SmsApp;
(function (SmsApp) {
    var SmsMessage = (function () {
        function SmsMessage() {
        }
        return SmsMessage;
    })();

    var InboxService = (function () {
        function InboxService($http, $location, $rootScope, signalRService) {
            var _this = this;
            this.$http = $http;
            this.connectionStatus = null;
            var inboxHub = signalRService.inboxHub;
            var outboundHub = signalRService.outboundHub;
            outboundHub.client.messageReceived = function (inboundMessage) {
                if (typeof (_this.messages) != "undefined") {
                    _this.messages.push({
                        Id: inboundMessage.MessageId,
                        Reference: inboundMessage.Recipient,
                        ReceivedAt: new Date().toISOString(),
                        To: { PhoneNumber: inboundMessage.Recipient },
                        From: { PhoneNumber: inboundMessage.Originator },
                        Direction: "Inbound",
                        Summary: inboundMessage.Body
                    });
                    if (!$rootScope.$$phase)
                        $rootScope.$apply();
                }

                if (window.Notification.permission !== "granted") {
                    if (window.Notification.permission !== 'denied') {
                        window.Notification.requestPermission(function (permission) {
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

            function displayNotification(inboundMessage) {
                var notification = new window.Notification(inboundMessage.Originator, {
                    body: inboundMessage.Body,
                    icon: '/Content/mail.png'
                });
                notification.onclick = function () {
                    $location.path('/inbox');
                    if (!$rootScope.$$phase)
                        $rootScope.$apply();
                };
            }
        }
        InboxService.prototype.getMessages = function () {
            var _this = this;
            if (this.inboxPromise == null) {
                this.inboxPromise = this.$http.get('Inbox/Messages').then(function (data) {
                    return _this.messages = (data.data == "" ? [] : data.data);
                }).then(function () {
                    return _this.messages;
                });
            }
            return this.inboxPromise;
        };
        return InboxService;
    })();
    SmsApp.InboxService = InboxService;
    SmsApp.smsApp.service('inboxService', ['$http', '$location', '$rootScope', 'signalRService', InboxService]);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=InboxService.js.map
