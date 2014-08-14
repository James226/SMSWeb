/// <reference path="../SmsApp.ts"/>

module SmsApp {
    export class InboxService {
        private inboxPromise: any;

        constructor(private $http: ng.IHttpService, $location: ng.ILocationService, $rootScope: ng.IRootScopeService) {
            this.inboxPromise = this.$http
                .get('Inbox/Messages')
                .then(data => data.data);
        }

        getMessages() {
            return this.inboxPromise;
        }
    }
    smsApp.service('inboxService', InboxService);
}