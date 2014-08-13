/// <reference path="../SmsApp.ts"/>
var SmsApp;
(function (SmsApp) {
    SmsApp.smsApp.controller('loginController', function ($scope, $http) {
        $scope.credentials = {
            username: $('#username').val(),
            password: $('#password').val()
        };

        $scope.processLogin = function () {
            $http({
                method: 'POST',
                url: '/Login/Auth',
                data: $scope.credentials,
                headers: { 'Content-Type': 'application/json' }
            }).success(function (data) {
                if (data.Success) {
                    window.location.href = '/';
                }
            });
        };
    });
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=LoginController.js.map
