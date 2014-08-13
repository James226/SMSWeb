/// <reference path="../SmsApp.ts"/>
var SmsApp;
(function (SmsApp) {
    var InboxService = (function () {
        function InboxService($http) {
            this.$http = $http;
        }
        InboxService.prototype.getMessages = function () {
            return this.$http.get('Inbox/Messages');
        };
        return InboxService;
    })();
    SmsApp.InboxService = InboxService;
    SmsApp.smsApp.service('inboxService', InboxService);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=InboxService.js.map
