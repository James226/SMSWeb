/// <reference path="../SmsApp.ts"/>
var SmsApp;
(function (SmsApp) {
    var SendController = (function () {
        function SendController($scope, $http, $location, details) {
            $scope.accounts = [];

            $scope.message = {
                accountreference: '',
                from: '',
                to: '',
                body: ''
            };

            $scope.sendMessage = function () {
                $http.post('Send/Send', $scope.message).success(function (data) {
                    $location.path('/');
                });
            };

            details.success(function (data) {
                for (var i in data.Accounts) {
                    if ($scope.message.accountreference == '') {
                        $scope.message.accountreference = data.Accounts[i].Reference;
                        $scope.message.from = data.Accounts[i].Address;
                    }
                    $scope.accounts.push(data.Accounts[i]);
                }
            });
        }
        return SendController;
    })();

    SmsApp.smsApp.controller('sendController', ['$scope', '$http', '$location', 'accountDetailsFactory', SendController]);
})(SmsApp || (SmsApp = {}));
//# sourceMappingURL=SendController.js.map
