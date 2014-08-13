/// <reference path="../typings/angularjs/angular.d.ts"/>

module SmsApp {
    export var smsApp: ng.IModule;

    var routes = {
        'mainController': 100,
        'sendController': 75,
        'inboxController': 50
    };

    smsApp = angular.module('smsApp', ['ngRoute', 'ngAnimate']).run(($rootScope, $route) => {
        $rootScope.$on('$routeChangeStart', (event, next, current) => {

            if (current !== undefined) {
                var pos = routes[next['$$route'].controller];

                $('body').animate({
                    'background-position': pos + '%'
                }, 500, 'linear');
            }

            if (current === undefined || routes[next['$$route'].controller] < routes[current['$$route'].controller]) {
                $('#main').addClass('left-slide');
                $('#main').removeClass('right-slide');
            } else {
                $('#main').addClass('right-slide');
                $('#main').removeClass('left-slide');
            }
        });
    });
}