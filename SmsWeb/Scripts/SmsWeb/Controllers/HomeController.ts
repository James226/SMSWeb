/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../SmsApp.ts" />

module SmsApp {
    class HomeController {
        constructor(private $scope) {
            $scope.message = "Test";
        }
    }

    smsApp.controller('mainController', HomeController);
}