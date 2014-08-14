/// <reference path="../SmsApp.ts"/>
var SmsApp;
(function (SmsApp) {
    var InboxService = (function () {
        function InboxService($http, $location, $rootScope) {
            this.$http = $http;
            this.inboxPromise = this.$http.get('Inbox/Messages').then(function (data) {
                return data.data;
            });
        }
        InboxService.prototype.getMessages = function () {
            return this.inboxPromise;
        };
        return InboxService;
    })();
    SmsApp.InboxService = InboxService;
    SmsApp.smsApp.service('inboxService', InboxService);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=InboxService.js.map
