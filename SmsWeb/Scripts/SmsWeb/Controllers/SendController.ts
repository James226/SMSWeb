/// <reference path="../SmsApp.ts"/>

module SmsApp {
    class SendController {
        constructor($scope, $http, $location, details) {
            $scope.accounts = [];

            $scope.message = {
                accountreference: '',
                from: '',
                to: '',
                body: ''
            };

            $scope.sendMessage = () => {
                $http.post('Send/Send', $scope.message)
                    .success(data => {
                        $location.path('/');
                    });
            }

            details.success(data => {
                for (var i in data.Accounts) {
                    if ($scope.message.accountreference == '') {
                        $scope.message.accountreference = data.Accounts[i].Reference;
                        $scope.message.from = data.Accounts[i].Address;
                    }
                    $scope.accounts.push(data.Accounts[i]);
                }
            });
        }
    }

    smsApp.controller('sendController', ['$scope', '$http', '$location', 'accountDetailsFactory', SendController]);
}