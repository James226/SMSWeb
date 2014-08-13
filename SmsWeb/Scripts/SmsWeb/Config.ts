/// <reference path="SmsApp.ts"/>

module SmsApp {
    smsApp.config($routeProvider => {
        $routeProvider
            .when('/', {
                templateUrl: 'Home/Home',
                controller: 'mainController'
            })
            .when('/login', {
                templateUrl: 'Login',
                controller: 'loginController'
            })
            .when('/send', {
                templateUrl: 'Send',
                controller: 'sendController'
            })
            .when('/inbox', {
                templateUrl: 'Inbox',
                controller: 'inboxController'
            });
    });
}