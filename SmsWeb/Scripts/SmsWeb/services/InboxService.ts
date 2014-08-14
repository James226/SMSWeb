/// <reference path="../SmsApp.ts"/>

module SmsApp {
    export class InboxService {
        private inboxPromise: any;
        private messages: any;

        constructor(private $http: ng.IHttpService, $location: ng.ILocationService, $rootScope: ng.IRootScopeService) {
            var inboxHub = $.connection.inboxHub;

            inboxHub.client.doStuff = () => {
                if (this.messages != null) {
                    this.messages.push({ "Id": "1d39f1f3-6d30-4e32-8b90-55b95a8b9e07", "Reference": "Drew", "Status": "Submitted", "LastStatusAt": null, "SubmittedAt": null, "ReceivedAt": new Date().toISOString(), "Type": "SMS", "To": { "PhoneNumber": "447786205137" }, "From": { "PhoneNumber": "447786205137" }, "Summary": "Inbox TEST / 2", "Body": "", "Direction": "Inbound", "Parts": "1", "Username": null });
                    if (!$rootScope.$$phase) $rootScope.$apply();
                }

                if (window.Notification.permission !== "granted") {
                    if (window.Notification.permission !== 'denied') {
                        window.Notification.requestPermission(permission => {
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

            $.connection.hub.start().done(() => {
                inboxHub.server.send("Test");
            });


            function displayNotification() {
                var notification = new window.Notification("New Message Received", {
                    body: 'Message Body....',
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