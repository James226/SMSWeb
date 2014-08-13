/// <reference path="../SmsApp.ts"/>

module SmsApp {
    export class InboxService {
        constructor(private $http: ng.IHttpService) {
        }

        getMessages() {
            return this.$http.get('Inbox/Messages');
        }
    }
    smsApp.service('inboxService', InboxService);
}