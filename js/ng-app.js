var domain = "http://icorp.soft-craft.in/icorpmm/index.php/";

var store = "downloads/";

var assetURL = "";

var fileName = "";

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

    $scope.addToCalendar = function (title, location, date) {


        date = date.split(",");
        var startDate = new Date(date[0], (parseInt(date[1]) - 1), date[2], date[3], date[4], date[5], 0, 0); //set to PG Day workshop date
        var endDate = new Date();
        var calendarName = "iCorpMM Calendar";
        endDate.setTime(startDate.getTime() + 18000000);
        var notes = "";
        var success = function (message) {
            alert("Meeting added to the calendar Successfully!");
        };
        var error = function (message) {
            alert("Could not Add the Meeting!");
        };
        // create a calendar (iOS only for now)
        window.plugins.calendar.createCalendar(calendarName);
        window.plugins.calendar.createEventInNamedCalendar(title, location, notes, startDate, endDate, calendarName, success, error);



    }
});

app.controller('joinMeetingController', function ($scope, $http) {



    $scope.user = window.localStorage.getItem("userDname");

    $scope.director = window.localStorage.getItem("isDirector");

    $scope.userId = window.localStorage.getItem("id");


    $scope.openlink = function (link) {
        window.open('downloads/' + link, '_blank', 'EnableViewPortScale=yes');
    };

    if (navigator.onLine === true) {
        $.ajax({
            url: domain + "get-meeting",
            type: 'GET',
            data: {id: getUrlParameter("id"), userId: window.localStorage.getItem("id")},
            success: function (response) {


                $.each((response.agenda), function (key, value) {


                    $.each((value.attachments), function (k, v) {

                        assetURL = "http://icorp.soft-craft.in/data/attachments/" + v.saved_filename;
                        fileName = v.saved_filename;  // using an absolute path also does not work


                        window.resolveLocalFileSystemURL(store + fileName, appStart, downloadAsset);





                    });
                });










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
            $('#myModal11').modal('toggle');

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


    $scope.getVotes = function (event, id, title) {
        $scope.agendaTitle = title;
        $scope.aId = id;
        $scope.uId = window.localStorage.getItem("id");

        if (navigator.onLine === true) {
            angular.element(event.target).children("i").attr("class", "fa fa-spinner fa-pulse");
            angular.element(event.target).prop("disabled", "disabled");

            $.ajax({
                url: domain + "agenda-votes",
                type: 'GET',
                data: {id: id, userId: window.localStorage.getItem("id")},
                success: function (response) {
                    window.localStorage.setItem("avotes_" + id, JSON.stringify(response));
                    $scope.$apply(function () {
                        $scope.votes = response;

                    });
                    $('#myModal11').modal('toggle');
                    $('a.btn-info').children("i").removeAttr("class");
                    $('a.btn-info').removeAttr("disabled");


                }
            });
        } else {
            $scope.votes = $.parseJSON(window.localStorage.getItem("avotes_" + id));
            $('#myModal11').modal('toggle');
            $('a.btn-info').children("i").removeAttr("class");
            $('a.btn-info').removeAttr("disabled");

        }
    };



});

app.controller('rbcController', function ($scope, $http) {
    $scope.user = window.localStorage.getItem("userDname");

    $scope.director = window.localStorage.getItem("isDirector");

    $scope.userId = window.localStorage.getItem("id");

    if (navigator.onLine === true) {
        $.ajax({
            url: domain + "rbc",
            type: 'GET',
            data: {userId: window.localStorage.getItem("id")},
            success: function (response) {
                window.localStorage.setItem("rbc", JSON.stringify(response));
                $scope.$apply(function () {
                    $scope.rbc = response;
                });
                $('.spinner').fadeOut(1000);
            }
        });
    } else {
        $scope.rbc = $.parseJSON(window.localStorage.getItem("rbc"));
        $('.spinner').fadeOut(1000);
    }
    $scope.vote = function (event, id, title, vote) {

        var currentdate = new Date();
        var datetime = currentdate.getFullYear() + "-"
                + (currentdate.getMonth() + 1) + "-"
                + currentdate.getDate() + " "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
        var data = {id: id, userId: window.localStorage.getItem("id"), vote: vote, voted_datetime: datetime};

        var url = domain + "vote-rbc";

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

});

app.controller('profileController', function ($scope, $http) {
    $scope.user = window.localStorage.getItem("userDname");

    $scope.director = window.localStorage.getItem("isDirector");

    $scope.userId = window.localStorage.getItem("id");

    if (navigator.onLine === true) {
        $.ajax({
            url: domain + "profile",
            type: 'GET',
            data: {userId: window.localStorage.getItem("id")},
            success: function (response) {
                window.localStorage.setItem("udetails", JSON.stringify(response));
                $scope.$apply(function () {
                    $scope.pdetails = response;
                });
                $('.spinner').fadeOut(1000);
            }
        });

        $.ajax({
            url: domain + "lprofile",
            type: 'GET',
            data: {userId: window.localStorage.getItem("id")},
            success: function (response) {
                window.localStorage.setItem("ldetails", JSON.stringify(response));
                $scope.$apply(function () {
                    $scope.ldetails = response;
                });
                $('.spinner').fadeOut(1000);
            }
        });

        $.ajax({
            url: domain + "disc",
            type: 'GET',
            data: {userId: window.localStorage.getItem("id")},
            success: function (response) {
                window.localStorage.setItem("disc", JSON.stringify(response));
                $scope.$apply(function () {
                    $scope.disc = response;
                });
                $('.spinner').fadeOut(1000);
            }
        });

    } else {
        $scope.pdetails = $.parseJSON(window.localStorage.getItem("udetails"));
        $scope.ldetails = $.parseJSON(window.localStorage.getItem("ldetails"));
        $scope.disc = $.parseJSON(window.localStorage.getItem("disc"));
        $('.spinner').fadeOut(1000);
    }


    $scope.copyPAddress = function () {
        $scope.pdetails.c_street1 = $scope.pdetails.p_street1;
        $scope.pdetails.c_street2 = $scope.pdetails.p_street2;
        $scope.pdetails.c_city = $scope.pdetails.p_city;
        $scope.pdetails.c_zipcode = $scope.pdetails.p_zipcode;
        $scope.pdetails.c_state = $scope.pdetails.p_state;
        $scope.pdetails.c_country = $scope.pdetails.p_country;
    };

    $scope.submit = function () {


        var data = $scope.pdetails;

        var url = domain + "profile-update";

        if (navigator.onLine === true) {

            $("#psubmit").children("i").attr("class", "fa fa-spinner fa-pulse");
            $("#psubmit").prop("disabled", "disabled");

            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                cache: false,
                success: function (response) {




                }
            });
            $("#psubmit").children("i").removeAttr("class");
            $("#psubmit").removeAttr("disabled");

        } else {

            toSync(url, data);

        }
    };

    $scope.lsubmit = function () {
        var data = $scope.ldetails;

        var url = domain + "lprofile-update";

        if (navigator.onLine === true) {

            $("#lsubmit").children("i").attr("class", "fa fa-spinner fa-pulse");
            $("#lsubmit").prop("disabled", "disabled");

            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                cache: false,
                success: function (response) {




                }
            });
            $("#lsubmit").children("i").removeAttr("class");
            $("#lsubmit").removeAttr("disabled");

        } else {

            toSync(url, data);

        }
    };

    $scope.addD = function () {
        var data = $("#frmNewParty").serialize();

        var url = domain + "disc-add";

        if (navigator.onLine === true) {

            $("#dsubmit").children("i").attr("class", "fa fa-spinner fa-pulse");
            $("#dsubmit").prop("disabled", "disabled");

            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                cache: false,
                success: function (response) {

                    $scope.$apply(function () {
                        $scope.disc = response;
                    });

                    $("#frmNewParty [type='text']").val("");

                }
            });
            $("#dsubmit").children("i").removeAttr("class");
            $("#dsubmit").removeAttr("disabled");

        } else {
            $("#frmNewParty [type='text']").val("");
            toSync(url, data);

        }
    };

    $scope.unint = function (event, id) {
        var data = {id: id};

        var url = domain + "unint";

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
            angular.element(event.target).parent().html("Resigned!");

        } else {

            //    angular.element(event.target).append("i").attr("class", "fa fa-spinner fa-pulse");
            toSync(url, data);
            angular.element(event.target).parent().html('<span class="text-info">You\'re not connected to the Internet at the moment! Your selection has been recorded and will be synced after you connect to the internet! </span>');

        }
    }

});

app.controller('archiveController', function ($scope, $http) {
    $scope.user = window.localStorage.getItem("userDname");
    if (navigator.onLine === true) {
        $.ajax({
            url: domain + "archive",
            type: 'GET',
            data: {id: window.localStorage.getItem("id")},
            success: function (response) {
                window.localStorage.setItem("archive", JSON.stringify(response));
                $scope.$apply(function () {
                    $scope.meetings = response;
                });
                $('.spinner').fadeOut(1000);
            }
        });
    } else {
        $scope.meetings = $.parseJSON(window.localStorage.getItem("archive"));
        $('.spinner').fadeOut(1000);
    }
});


app.controller('reportsController', function ($scope, $http) {
    $scope.user = window.localStorage.getItem("userDname");
    $scope.director = window.localStorage.getItem("isDirector");

    if (navigator.onLine === true) {
        $.ajax({
            url: domain + "reports",
            type: 'GET',
            data: {id: window.localStorage.getItem("id")},
            success: function (response) {
                window.localStorage.setItem("reports", JSON.stringify(response));
                $scope.$apply(function () {
                    $scope.reports = response;
                });
                $('.spinner').fadeOut(1000);
            }
        });
    } else {
        $scope.reports = $.parseJSON(window.localStorage.getItem("reports"));
        $('.spinner').fadeOut(1000);
    }
});


function downloadAsset() {
    var fileTransfer = new FileTransfer();
    alert(assetURL + " " + fileName);
    fileTransfer.download(assetURL, window.appRootDir.fullPath + "/" + store + fileName,
            function (entry) {
                alert("Success!");

            },
            function (err) {
                alert("Error");
                alert(JSON.stringify(err));
            });
}

//I'm only called when the file exists or has been downloaded.
function appStart() {
    alert("App ready!");
}