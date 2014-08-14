/// <reference path="../SmsApp.ts"/>
var SmsApp;
(function (SmsApp) {
    var InboxService = (function () {
        function InboxService($http, $location, $rootScope) {
            var _this = this;
            this.$http = $http;
            var inboxHub = $.connection.inboxHub;

            inboxHub.client.doStuff = function () {
                if (_this.messages != null) {
                    _this.messages.push({ "Id": "1d39f1f3-6d30-4e32-8b90-55b95a8b9e07", "Reference": "Drew", "Status": "Submitted", "LastStatusAt": null, "SubmittedAt": null, "ReceivedAt": new Date().toISOString(), "Type": "SMS", "To": { "PhoneNumber": "447786205137" }, "From": { "PhoneNumber": "447786205137" }, "Summary": "Inbox TEST / 2", "Body": "", "Direction": "Inbound", "Parts": "1", "Username": null });
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
                                displayNotification();
                            }
                        });
                    }
                } else {
                    if (window.Notification.permission === "granted") {
                        displayNotification();
                    } else {
                        alert("A new message has been received");
                    }
                }
            };

            $.connection.hub.start().done(function () {
                inboxHub.server.send("Test");
            });

            function displayNotification() {
                var notification = new window.Notification("New Message Received", {
                    body: 'Message Body....',
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
        return InboxService;
    })();
    SmsApp.InboxService = InboxService;
    SmsApp.smsApp.service('inboxService', InboxService);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=InboxService.js.map
