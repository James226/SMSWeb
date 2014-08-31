/// <reference path="../SmsApp.ts"/>
var SmsApp;
(function (SmsApp) {
    SmsApp.smsApp.factory("accountDetailsFactory", function ($http) {
        return $http.get('Account/Details', { cache: true });
    });
})(SmsApp || (SmsApp = {}));
