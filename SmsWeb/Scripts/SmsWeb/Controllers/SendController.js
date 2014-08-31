/// <reference path="../SmsApp.ts"/>
var SmsApp;
(function (SmsApp) {
    var SendController = (function () {
        function SendController($scope, $http, $location, details, outboundService) {
            $scope.accounts = [];

            $scope.message = {
                accountreference: '',
                from: '',
                to: '',
                body: '',
                numParts: function () {
                    if (this.body.length <= 160)
                        return 1;
                    return Math.ceil(this.body.length / 153);
                }
            };

            $scope.sendMessage = function () {
                //$http.post('Send/Send', $scope.message)
                //    .success(data => {
                //        $location.path('/');
                //    });
                outboundService.sendMessage($scope.message.from, $scope.message.to, $scope.message.body);
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

    SmsApp.smsApp.controller('sendController', ['$scope', '$http', '$location', 'accountDetailsFactory', 'outboundService', SendController]);
})(SmsApp || (SmsApp = {}));
