/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../SmsApp.ts" />
var SmsApp;
(function (SmsApp) {
    var HomeController = (function () {
        function HomeController($scope) {
            this.$scope = $scope;
            $scope.message = "Test";
        }
        return HomeController;
    })();

    SmsApp.smsApp.controller('mainController', HomeController);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=HomeController.js.map
