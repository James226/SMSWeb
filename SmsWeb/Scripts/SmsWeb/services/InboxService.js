/// <reference path="../SmsApp.ts"/>
/// <reference path="SignalRService.ts"/>
var SmsApp;
(function (SmsApp) {
    var InboxService = (function () {
        function InboxService($http, $location, $rootScope, signalRService) {
            var _this = this;
            this.$http = $http;
            this.connectionStatus = null;
            var inboxHub = signalRService.inboxHub;
            var self = this;
            inboxHub.client.messageReceived = function (inboundMessage) {
                if (_this.messages != null) {
                    _this.messages.push({
                        Id: inboundMessage.MessageId,
                        Reference: inboundMessage.AccountId,
                        ReceivedAt: new Date().toISOString(),
                        To: { PhoneNumber: inboundMessage.To },
                        From: { PhoneNumber: inboundMessage.From },
                        Direction: "Inbound",
                        Summary: inboundMessage.MessageText
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

            signalRService.outboundHub.client.updateStatus = function (status) {
                return self.connectionStatus(status);
            };

            function displayNotification(inboundMessage) {
                var notification = new window.Notification("New Message Received", {
                    body: inboundMessage.MessageText,
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
                    return _this.messages = data.data;
                }).then(function () {
                    return _this.messages;
                });
            }
            return this.inboxPromise;
        };

        InboxService.prototype.onStatusUpdate = function (callback) {
            this.connectionStatus = callback;
        };
        return InboxService;
    })();
    SmsApp.InboxService = InboxService;
    SmsApp.smsApp.service('inboxService', ['$http', '$location', '$rootScope', 'signalRService', InboxService]);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=InboxService.js.map
