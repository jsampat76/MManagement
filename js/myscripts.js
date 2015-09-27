function progress(e) {
    if (e.lengthComputable) {
        //this makes a nice fancy progress bar
        $('progress').attr({value: e.loaded, max: e.total});
    }
}




$(document).ready(function () {
    setInterval(function () {

        if (window.localStorage.getItem("id") == null) {
            $(".menuu").hide();
        }
    }, 500);



    document.addEventListener('deviceready', function () {
        initPushwoosh();


    }, false);






    if (window.localStorage.getItem("toSync") === null || window.localStorage.getItem("toSync") === "") {
        window.localStorage.setItem("toSync", JSON.stringify([]));
    } else {
        if (navigator.onLine === true) {
            var toSync = $.parseJSON(window.localStorage.getItem("toSync"));

            $.each(toSync, function (i, k) {
                var index = i;
                $.ajax({
                    url: k.url,
                    type: 'GET',
                    data: k.data,
                    success: function (response) {


                    }
                });


            });



        }
    }

    $("#dob").datepicker({dateFormat: 'yy-mm-dd'});
    $("#date_ofowner").datepicker({dateFormat: 'yy-mm-dd'});
    $("[name='passport_issuedate']").datepicker({dateFormat: 'yy-mm-dd'});
    $("[name='passport_expirydate']").datepicker({dateFormat: 'yy-mm-dd'});

    $("body").on("click", "#accordion li.parent", function () {
        if (false === $(this).children("ul").is(':visible')) {
            $('#accordion ul').slideUp(300);
        }
        $(this).children("ul").slideToggle(300);
    });



    $("#syncNow").bind("click", function () {
        if (navigator.onLine === true) {
            $('#syncNow i').addClass("fa-spin");
            $('#syncNow span').text("Syncing ...");

            setTimeout(function () {
                sync();
            }, 1000);
        } else {
            $('#syncNow span').text("Please Connect to the Internet first");
        }

    });

});



function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function toSync(url, data) {
    var toSync = $.parseJSON(window.localStorage.getItem("toSync"));
    toSync.push({url: url, data: data});
    window.localStorage.setItem("toSync", JSON.stringify(toSync));
}


function initPushwoosh() {
    var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");

    //set push notification callback before we initialize the plugin
    document.addEventListener('push-notification', function (event) {
        //get the notification payload
        var notification = event.notification;

        //display alert to the user for example


        //clear the app badge
        pushNotification.setApplicationIconBadgeNumber(0);
    });

    //initialize the plugin
    pushNotification.onDeviceReady({pw_appid: "3E31C-54A41"});

    //register for pushes
    pushNotification.registerDevice(
            function (status) {
                var deviceToken = status['deviceToken'];
                window.localStorage.setItem('oneSignalId', deviceToken);
            },
            function (status) {
                console.warn('failed to register : ' + JSON.stringify(status));
                // alert(JSON.stringify(['failed to register ', status]));
            }
    );

    //reset badges on app start
    pushNotification.setApplicationIconBadgeNumber(0);
}


function sync() {





    $.ajax({
        url: domain + "scheduler",
        type: 'GET',
        async: false,
        data: {id: window.localStorage.getItem("id")},
        success: function (response) {
            window.localStorage.setItem("proposals", JSON.stringify(response));

            $.each(response, function (key, value) {
                $.ajax({
                    url: domain + "get-schedule",
                    type: 'GET',
                    async: false,
                    data: {id: value.id, userId: window.localStorage.getItem("id")},
                    success: function (response) {
                        window.localStorage.setItem("schedule_" + response.id, JSON.stringify(response));
                    }
                });
            });
        }
    });

    $.ajax({
        url: domain + "meetings",
        type: 'GET',
        async: false,
        data: {id: window.localStorage.getItem("id")},
        success: function (response) {
            window.localStorage.setItem("meetings", JSON.stringify(response));

            $.each(response, function (key, value) {
                $.ajax({
                    url: domain + "get-meeting",
                    type: 'GET',
                    async: false,
                    data: {id: value.id, userId: window.localStorage.getItem("id")},
                    success: function (response) {
                        window.localStorage.setItem("meeting_" + response.id, JSON.stringify(response));
                        $.each((response.agenda), function (key, value) {

                            $.ajax({
                                url: domain + "get-comments",
                                type: 'GET',
                                async: false,
                                data: {id: value.id, userId: window.localStorage.getItem("id")},
                                success: function (response) {
                                    window.localStorage.setItem("comment_" + value.id, JSON.stringify(response));
                                }
                            });


                            $.ajax({
                                url: domain + "get-notes",
                                type: 'GET',
                                async: false,
                                data: {id: value.id, userId: window.localStorage.getItem("id")},
                                success: function (response) {
                                    window.localStorage.setItem("note_" + value.id, JSON.stringify(response));
                                }
                            });

                            $.ajax({
                                url: domain + "agenda-votes",
                                type: 'GET',
                                async: false,
                                data: {id: value.id, userId: window.localStorage.getItem("id")},
                                success: function (response) {
                                    window.localStorage.setItem("avotes_" + value.id, JSON.stringify(response));

                                }
                            });


                            $.each((value.attachments), function (k, v) {
                                assetURL = "http://icorp.soft-craft.in/data/attachments/" + v.saved_filename;
                                fileName = v.saved_filename;  // using an absolute path also does not work
                                store = cordova.file.dataDirectory;
                                var fileTransfer = new FileTransfer();
                                $('#syncNow i').addClass("fa-spin");
                                $('#syncNow span').text("Syncing Meeting Attachments ...");
                                fileTransfer.download(assetURL, store + fileName,
                                        function (entry) {
                                            $('#syncNow i').removeClass("fa-spin");
                                            $('#syncNow span').text("Synced");
                                        },
                                        function (err) {
                                            $('#syncNow i').removeClass("fa-spin");
                                            $('#syncNow span').text("Synced");

                                        });
                            });
                        });

                    }
                });
            });

        }
    });



    $.ajax({
        url: domain + "rbc",
        type: 'GET',
        data: {userId: window.localStorage.getItem("id")},
        success: function (response) {
            window.localStorage.setItem("rbc", JSON.stringify(response));

            $.each((response), function (key, value) {


                $.each((value.attachments), function (k, v) {

                    assetURL = "http://icorp.soft-craft.in/data/attachments/" + v.saved_filename;
                    fileName = v.saved_filename;  // using an absolute path also does not work
                    store = cordova.file.dataDirectory;


                    // window.resolveLocalFileSystemURL(store + fileName, appStart, downloadAsset);

                    var fileTransfer = new FileTransfer();
                    $('#syncNow i').addClass("fa-spin");
                    $('#syncNow span').text("Syncing RBC Attachments ...");
                    fileTransfer.download(assetURL, store + fileName,
                            function (entry) {
                                //  alert(JSON.stringify(entry));
                                $('#syncNow i').removeClass("fa-spin");
                                $('#syncNow span').text("Synced");
                            },
                            function (err) {
                                $('#syncNow i').removeClass("fa-spin");
                                $('#syncNow span').text("Synced");
                                //  alert(JSON.stringify(err));
                            });

                });
            });


        }
    });


    $.ajax({
        url: domain + "archive",
        type: 'GET',
        async: false,
        data: {id: window.localStorage.getItem("id")},
        success: function (response) {
            window.localStorage.setItem("archive", JSON.stringify(response));

            $.each(response, function (key, value) {
                $.ajax({
                    url: domain + "get-meeting",
                    type: 'GET',
                    async: false,
                    data: {id: value.id, userId: window.localStorage.getItem("id")},
                    success: function (response) {
                        window.localStorage.setItem("meeting_" + response.id, JSON.stringify(response));
                        $.each((response.agenda), function (key, value) {

                            $.ajax({
                                url: domain + "get-comments",
                                type: 'GET',
                                async: false,
                                data: {id: value.id, userId: window.localStorage.getItem("id")},
                                success: function (response) {
                                    window.localStorage.setItem("comment_" + value.id, JSON.stringify(response));
                                }
                            });


                            $.ajax({
                                url: domain + "get-notes",
                                type: 'GET',
                                async: false,
                                data: {id: value.id, userId: window.localStorage.getItem("id")},
                                success: function (response) {
                                    window.localStorage.setItem("note_" + value.id, JSON.stringify(response));
                                }
                            });

                            $.ajax({
                                url: domain + "agenda-votes",
                                type: 'GET',
                                async: false,
                                data: {id: value.id, userId: window.localStorage.getItem("id")},
                                success: function (response) {
                                    window.localStorage.setItem("avotes_" + value.id, JSON.stringify(response));

                                }
                            });


                            $.each((value.attachments), function (k, v) {
                                assetURL = "http://icorp.soft-craft.in/data/attachments/" + v.saved_filename;
                                fileName = v.saved_filename;  // using an absolute path also does not work
                                store = cordova.file.dataDirectory;
                                var fileTransfer = new FileTransfer();
                                $('#syncNow i').addClass("fa-spin");
                                $('#syncNow span').text("Syncing Archive Attachments ...");
                                fileTransfer.download(assetURL, store + fileName,
                                        function (entry) {
                                            $('#syncNow i').removeClass("fa-spin");
                                            $('#syncNow span').text("Synced");
                                        },
                                        function (err) {
                                            $('#syncNow i').removeClass("fa-spin");
                                            $('#syncNow span').text("Synced");
                                        });
                            });
                        });

                    }
                });
            });
        }
    });



    $.ajax({
        url: domain + "reports",
        type: 'GET',
        async: false,
        data: {id: window.localStorage.getItem("id")},
        success: function (response) {
            window.localStorage.setItem("reports", JSON.stringify(response));

        }
    });


    $.ajax({
        url: domain + "profile",
        type: 'GET',
        async: false,
        data: {userId: window.localStorage.getItem("id")},
        success: function (response) {
            window.localStorage.setItem("udetails", JSON.stringify(response));

        }
    });

    $.ajax({
        url: domain + "lprofile",
        type: 'GET',
        async: false,
        data: {userId: window.localStorage.getItem("id")},
        success: function (response) {
            window.localStorage.setItem("ldetails", JSON.stringify(response));

        }
    });

    $.ajax({
        url: domain + "disc",
        type: 'GET',
        async: false,
        data: {userId: window.localStorage.getItem("id")},
        success: function (response) {
            window.localStorage.setItem("disc", JSON.stringify(response));
            $('#syncNow i').removeClass("fa-spin");
            $('#syncNow span').text("Synced");

        }
    });


}