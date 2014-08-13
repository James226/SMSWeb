/// <reference path="../SmsApp.ts"/>

module SmsApp {
    smsApp.factory("accountDetailsFactory", function($http) {
        return $http.get('Account/Details', { cache: true });
    });
}