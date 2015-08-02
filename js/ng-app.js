var domain = "http://www.boxcommerce.in/icorpmm/";

var app = angular.module('iCorpMM', ['ngResource', 'ngSanitize']);

app.filter('convertToDate', function () {
    return function (str) {
        return new Date(str);
    };
});
app.filter('unsafe', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
});

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

app.controller('confirmTimingsController', function ($scope, $http) {
    $scope.user = window.localStorage.getItem("userDname");
    if (navigator.onLine === true) {
        $.ajax({
            url: domain + "get-schedule",
            type: 'GET',
            data: {id: getUrlParameter("id"), userId: window.localStorage.getItem("id")},
            success: function (response) {
                window.localStorage.setItem("schedule_" + getUrlParameter("id"), JSON.stringify(response));
                $scope.$apply(function () {
                    $scope.proposal = response;
                });
                $('.spinner').fadeOut(1000);
            }
        });
    } else {
        $scope.proposal = $.parseJSON(window.localStorage.getItem("schedule_" + getUrlParameter("id")));
        $('.spinner').fadeOut(1000);
    }


    $scope.confirm = function (event, id, status, time) {
        var url = domain + "confirm";
        var data = {id: id, userId: window.localStorage.getItem("id"), status: status, time: time};
        if (navigator.onLine === true) {

            angular.element(event.target).children("i").attr("class", "fa fa-spinner fa-pulse");

            $.ajax({
                url: url,
                type: 'GET',
                data: data,
                success: function (response) {
                    if (status == 1) {
                        angular.element(event.target).parent().html('<span class="text-success"><i class="fa fa-check"></i> Available</span>');
                    } else {
                        angular.element(event.target).parent().html('<span class="text-danger"><i class="fa fa-ban"></i> Unavailable</span>');
                    }
                }
            });
            angular.element(event.target).parent().parent().find("select").prop("disabled", "disabled");

        } else {
            angular.element(event.target).parent().parent().find("select").prop("disabled", "disabled");

            angular.element(event.target).children("i").attr("class", "fa fa-spinner fa-pulse");
            toSync(url, data);
            angular.element(event.target).parent().html('<span class="text-info">You\'re not connected to the Internet at the moment! Your selection has been recorded and will be synced after you connect to the internet! </span>');

        }
    };

});


app.controller('meetingsController', function ($scope, $http) {
    $scope.user = window.localStorage.getItem("userDname");
    if (navigator.onLine === true) {
        $.ajax({
            url: domain + "meetings",
            type: 'GET',
            data: {id: window.localStorage.getItem("id")},
            success: function (response) {
                window.localStorage.setItem("meetings", JSON.stringify(response));
                $scope.$apply(function () {
                    $scope.meetings = response;
                });
                $('.spinner').fadeOut(1000);
            }
        });
    } else {
        $scope.meetings = $.parseJSON(window.localStorage.getItem("meetings"));
        $('.spinner').fadeOut(1000);
    }
});


app.controller('joinMeetingController', function ($scope, $http) {
    $scope.user = window.localStorage.getItem("userDname");
    if (navigator.onLine === true) {
        $.ajax({
            url: domain + "get-meeting",
            type: 'GET',
            data: {id: getUrlParameter("id"), userId: window.localStorage.getItem("id")},
            success: function (response) {
                window.localStorage.setItem("meeting_" + getUrlParameter("id"), JSON.stringify(response));
                $scope.$apply(function () {
                    $scope.meeting = response;

                    $scope.confirmation = $.grep($scope.meeting.invities, function (e) {
                        return e.id == window.localStorage.getItem("id");
                    });


                });
                $('.spinner').fadeOut(1000);
            }
        });
    } else {
        $scope.meeting = $.parseJSON(window.localStorage.getItem("meeting_" + getUrlParameter("id")));
        $scope.confirmation = $.grep($scope.meeting.invities, function (e) {
            return e.id == window.localStorage.getItem("id");
        });
        $('.spinner').fadeOut(1000);
    }


    $scope.attend = function (event, id, attending) {
        var url = domain + "meeting-confirm";
        var data = {id: id, userId: window.localStorage.getItem("id"), vote: attending};
        if (navigator.onLine === true) {

            angular.element(event.target).children("i").attr("class", "fa fa-spinner fa-pulse");

            $.ajax({
                url: url,
                type: 'GET',
                data: data,
                success: function (response) {
                    if (attending == 1) {
                        angular.element(event.target).parent().parent().html('<a href="#" class="btn btn-xs btn-success"> Acknowledged the receipt of the notice. Yes, confirmed attendance. </a>');
                    } else {
                        angular.element(event.target).parent().parent().html('<a href="#" class="btn btn-xs btn-danger"> Acknowledged the receipt of the notice. Not Attending, please grant leave. </a>');
                    }
                }
            });

        } else {

            angular.element(event.target).children("i").attr("class", "fa fa-spinner fa-pulse");
            toSync(url, data);
            angular.element(event.target).parent().parent().html('<span class="text-info">You\'re not connected to the Internet at the moment! Your selection has been recorded and will be synced after you connect to the internet! </span>');

        }
    };

});