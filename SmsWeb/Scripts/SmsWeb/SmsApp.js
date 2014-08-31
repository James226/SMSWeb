/// <reference path="../typings/angularjs/angular.d.ts"/>
/// <referencep path="services/OutboundService.ts"/>
var SmsApp;
(function (SmsApp) {
    SmsApp.smsApp;

    var routes = {
        'mainController': 100,
        'sendController': 75,
        'inboxController': 50
    };

    SmsApp.smsApp = angular.module('smsApp', ['ngRoute', 'ngAnimate']).run(function ($rootScope, $route, $templateCache, $http, inboxService, outboundService, notificationService) {
        outboundService.onStatusUpdate(function (status) {
            $rootScope.ConnectionStatus = status;
            switch (status) {
                case "Connected":
                    $rootScope.ConnectionStatusIcon = 'glyphicon-ok';
                    break;
                case "Connecting":
                    $rootScope.ConnectionStatusIcon = 'glyphicon-retweet';
                    break;
                case "Closed":
                    $rootScope.ConnectionStatusIcon = 'glyphicon-remove';
                    break;
            }
            if (!$rootScope.$$phase)
                $rootScope.$apply();
        });

        $rootScope.Notifications = notificationService;
        notificationService.notificationPulse = function () {
            if (!$rootScope.$$phase)
                $rootScope.$apply();
        };

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
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

        var url;
        for (var i in $route.routes) {
            if (url = $route.routes[i].templateUrl) {
                $http.get(url, { cache: $templateCache });
            }
        }
    });

    SmsApp.smsApp.directive('ngRightClick', function ($parse) {
        return function (scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function (event) {
                scope.$apply(function () {
                    event.preventDefault();
                    fn(scope, { $event: event });
                });
            });
        };
    });
})(SmsApp || (SmsApp = {}));
