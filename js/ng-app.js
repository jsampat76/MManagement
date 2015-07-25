var domain = "http://icorpmm.lu/";

var app = angular.module('iCorpMM', ['ngResource', 'ngSanitize']);

app.controller('loginController', function ($scope, $http) {
    $('.spinner').fadeOut(1000);
    $scope.checkLogin = function () {
        $('.spinner').fadeIn();
        $.ajax({
            url: domain + "login",
            type: 'GET',
            data: $('[name=login]').serialize(),
            success: function (response) {
                $('.spinner').fadeOut(1000);
                if ($.isEmptyObject(response)) {
                    $("#loginResult").html("Sorry! Invalid Credentials");
                } else {
                    $("#loginResult").html("Successfully Logged In!");
                    window.localStorage.setItem("id", response.id);
                    window.localStorage.setItem("userFname", response.firstname);
                    window.localStorage.setItem("userLname", response.lastname);
                    window.localStorage.setItem("userDname", response.display_name);
                    window.localStorage.setItem("userEmail", response.email);
                    window.localStorage.setItem("userPassword", $scope.password);
                    window.location.href = "scheduler.html";
                }
            }
        });

    }
});

app.controller('schedulerController', function ($scope, $http) {
    $scope.user = window.localStorage.getItem("userDname");
    if (navigator.onLine === true) {
        $.ajax({
            url: domain + "scheduler",
            type: 'GET',
            data: {id: window.localStorage.getItem("id")},
            success: function (response) {
                window.localStorage.setItem("proposals", JSON.stringify(response));
                $scope.$apply(function () {
                    $scope.proposals = response;
                });
                $('.spinner').fadeOut(1000);
            }
        });
    } else {
        $scope.proposals = $.parseJSON(window.localStorage.getItem("proposals"));
        $('.spinner').fadeOut(1000);
    }
});