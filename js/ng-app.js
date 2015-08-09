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

app.filter('base64decode', function () {
    return function (str) {
        return atob(str);
    };
});

app.controller('homeController', function ($scope, $http) {

    $scope.loggedin = window.localStorage.getItem("id") === null ? 0 : 1;
    $('.spinner').fadeOut(1000);
});

app.controller('loginController', function ($scope, $http) {
    $scope.playerId = window.localStorage.getItem("oneSignalId");
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
                    window.localStorage.setItem("userDesgn", response.designation);
                    window.localStorage.setItem("isDirector", response.designation.toLowerCase().indexOf("director") > -1 ? 1 : 0);
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

    $scope.director = window.localStorage.getItem("isDirector");

    $scope.userId = window.localStorage.getItem("id");

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

    $scope.submitAgenda = function () {
        var data = new FormData($('#frmNewAgenda')[0]);

        var url = domain + "add-agenda";

        if (navigator.onLine === true) {

            angular.element(event.target).children("i").attr("class", "fa fa-spinner fa-pulse");
            angular.element(event.target).prop("disabled", "disabled");

            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                xhr: function () {
                    var myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload) {
                        myXhr.upload.addEventListener('progress', progress, false);
                    }
                    return myXhr;
                },
                cache: false,
                contentType: false,
                processData: false,
                success: function (response) {
                    $('#submit').children("i").removeAttr("class");
                    $('#submit').removeAttr("disabled");
                    $('#frmNewAgenda input[type="text"],textarea,input[type="file"]').val("");
                    window.localStorage.setItem("meeting_" + getUrlParameter("id"), JSON.stringify(response));
                    $scope.$apply(function () {
                        $scope.meeting = response;

                        $scope.confirmation = $.grep($scope.meeting.invities, function (e) {
                            return e.id == window.localStorage.getItem("id");
                        });


                    });


                }
            });

        } else {

            //    angular.element(event.target).append("i").attr("class", "fa fa-spinner fa-pulse");
            toSync(url, data);
            angular.element(event.target).parent().parent().append('<span class="text-info">You\'re not connected to the Internet at the moment! Your selection has been recorded and will be synced after you connect to the internet! </span>');

        }
    };

    $scope.getComments = function (event, id, title) {
        $scope.agendaTitle = title;
        $scope.aId = id;
        $scope.uId = window.localStorage.getItem("id");

        if (navigator.onLine === true) {
            angular.element(event.target).children("i").attr("class", "fa fa-spinner fa-pulse");
            angular.element(event.target).prop("disabled", "disabled");

            $.ajax({
                url: domain + "get-comments",
                type: 'GET',
                data: {id: id, userId: window.localStorage.getItem("id")},
                success: function (response) {
                    window.localStorage.setItem("comment_" + id, JSON.stringify(response));
                    $scope.$apply(function () {
                        $scope.comments = response;

                    });
                    $('#myModal').modal('toggle');
                    $('a.btn-info').children("i").removeAttr("class");
                    $('a.btn-info').removeAttr("disabled");


                }
            });
        } else {
            $scope.comments = $.parseJSON(window.localStorage.getItem("comment_" + id));


        }
    };

    $scope.comment = function () {
        var data = new FormData($('[name="commentF"]')[0]);

        var url = domain + "comment";

        if (navigator.onLine === true) {

            angular.element(event.target).children("i").attr("class", "fa fa-spinner fa-pulse");
            angular.element(event.target).prop("disabled", "disabled");

            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                success: function (response) {
                    $('#submitC').children("i").removeAttr("class");
                    $('#submitC').removeAttr("disabled");
                    $('[nme="commentF"] input[type="text"],textarea,input[type="file"]').val("");
                    $scope.$apply(function () {
                        $scope.comments = response;

                    });


                }
            });

        } else {

            //    angular.element(event.target).append("i").attr("class", "fa fa-spinner fa-pulse");
            toSync(url, data);
            angular.element(event.target).parent().parent().append('<span class="text-info">You\'re not connected to the Internet at the moment! Your selection has been recorded and will be synced after you connect to the internet! </span>');

        }
    };

    $scope.vote = function (event, id, title, vote) {
        var data = {id: id, userId: window.localStorage.getItem("id"), vote: vote};

        var url = domain + "vote";

        if (navigator.onLine === true) {

            angular.element(event.target).children("i").attr("class", "fa fa-spinner fa-pulse");
            angular.element(event.target).prop("disabled", "disabled");

            $.ajax({
                url: url,
                type: 'GET',
                data: data,
                cache: false,
                success: function (response) {




                }
            });
            angular.element(event.target).parent().html("Voted!");

        } else {

            //    angular.element(event.target).append("i").attr("class", "fa fa-spinner fa-pulse");
            toSync(url, data);
            angular.element(event.target).parent().html('<span class="text-info">You\'re not connected to the Internet at the moment! Your selection has been recorded and will be synced after you connect to the internet! </span>');

        }
    };

    $scope.getDNotes = function (event, id, title) {
        $scope.agendaTitle = title;
        $scope.aId = id;
        $scope.uId = window.localStorage.getItem("id");

        if (navigator.onLine === true) {
            angular.element(event.target).children("i").attr("class", "fa fa-spinner fa-pulse");
            angular.element(event.target).prop("disabled", "disabled");

            $.ajax({
                url: domain + "get-notes",
                type: 'GET',
                data: {id: id, userId: window.localStorage.getItem("id")},
                success: function (response) {
                    window.localStorage.setItem("note_" + id, JSON.stringify(response));
                    $scope.$apply(function () {
                        $scope.notes = response;

                    });
                    $('#myModal2').modal('toggle');
                    $('a.btn-info').children("i").removeAttr("class");
                    $('a.btn-info').removeAttr("disabled");


                }
            });
        } else {
            $scope.notes = $.parseJSON(window.localStorage.getItem("note_" + id));


        }
    };


    $scope.note = function () {
        var data = new FormData($('[name="noteF"]')[0]);

        var url = domain + "note";

        if (navigator.onLine === true) {

            angular.element(event.target).children("i").attr("class", "fa fa-spinner fa-pulse");
            angular.element(event.target).prop("disabled", "disabled");

            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                success: function (response) {
                    $('#submitN').children("i").removeAttr("class");
                    $('#submitN').removeAttr("disabled");
                    $('[name="noteF"] input[type="text"],textarea,input[type="file"]').val("");
                    $scope.$apply(function () {
                        $scope.notes = response;

                    });


                }
            });

        } else {

            //    angular.element(event.target).append("i").attr("class", "fa fa-spinner fa-pulse");
            toSync(url, data);
            angular.element(event.target).parent().parent().append('<span class="text-info">You\'re not connected to the Internet at the moment! Your selection has been recorded and will be synced after you connect to the internet! </span>');

        }
    };



});