var domain = "http://icorpmm.com/";

var app = angular.module('iCorpMM', ['ngResource', 'ngSanitize']);

app.controller('homeController', function ($scope, $http) {
    $("#dvLoading").hide();
});
