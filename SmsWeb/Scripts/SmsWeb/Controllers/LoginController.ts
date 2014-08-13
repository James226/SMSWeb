/// <reference path="../SmsApp.ts"/>

module SmsApp {
    smsApp.controller('loginController', function ($scope, $http) {
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
            })
                .success(function (data) {
                    if (data.Success) {
                        window.location.href = '/';
                    }
                });
        };
    });
}