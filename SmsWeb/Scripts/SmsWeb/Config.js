/// <reference path="SmsApp.ts"/>
var SmsApp;
(function (SmsApp) {
    SmsApp.smsApp.config(function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'Home/Home',
            controller: 'mainController'
        }).when('/login', {
            templateUrl: 'Login',
            controller: 'loginController'
        }).when('/send', {
            templateUrl: 'Send',
            controller: 'sendController'
        }).when('/inbox', {
            templateUrl: 'Inbox',
            controller: 'inboxController'
        });
    });
})(SmsApp || (SmsApp = {}));
