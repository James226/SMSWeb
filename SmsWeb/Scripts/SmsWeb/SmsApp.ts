/// <reference path="../typings/angularjs/angular.d.ts"/>
/// <referencep path="services/OutboundService.ts"/>

module SmsApp {
    export var smsApp: ng.IModule;

    var routes = {
        'mainController': 100,
        'sendController': 75,
        'inboxController': 50
    };

    smsApp = angular.module('smsApp', ['ngRoute', 'ngAnimate']).run(($rootScope, $route, $templateCache, $http, inboxService: InboxService, outboundService: OutboundService, notificationService: NotificationService) => {
        outboundService.onStatusUpdate((status) => {
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
            if (!$rootScope.$$phase) $rootScope.$apply();
        });

        $rootScope.Notifications = notificationService;
        notificationService.notificationPulse = () => {
            if (!$rootScope.$$phase) $rootScope.$apply();
        };

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

        var url;
        for (var i in $route.routes) {
            if (url = $route.routes[i].templateUrl) {
                $http.get(url, { cache: $templateCache });
            }
        }
    });

    smsApp.directive('ngRightClick', function ($parse) {
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
}