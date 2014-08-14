/// <reference path="../SmsApp.ts"/>

module SmsApp {
    smsApp.controller('sendController', [
        '$scope', '$http', '$location', 'accountDetailsFactory', function($scope, $http, $location, details) {
            $scope.accounts = [];

            $scope.message = {
                accountreference: '',
                from: '',
                to: '',
                body: ''
            };

            $scope.sendMessage = function() {
                $http.post('Send/Send', $scope.message)
                    .success(function(data) {
                        $location.path('/');
                    });
            }

            details.success(function(data) {
                for (var i in data.Accounts) {
                    $scope.accounts.push(data.Accounts[i]);
                }
                console.log(data);
            });
        }
    ]);
}