function progress(e) {
    if (e.lengthComputable) {
        //this makes a nice fancy progress bar
        $('progress').attr({value: e.loaded, max: e.total});
    }
}




$(document).ready(function () {
    document.addEventListener('deviceready', function () {
        var notificationOpenedCallback = function (jsonData) {
            alert(JSON.stringify(jsonData));
            console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
        };

        window.plugins.OneSignal.init("53fbc7d0-39fc-11e5-b0bc-eb69920f0c40",
                {googleProjectNumber: ""},
        notificationOpenedCallback);

        // Show an alert box if a notification comes in when the user is in your app.
        window.plugins.OneSignal.enableInAppAlertNotification(true);

        window.plugins.OneSignal.getIds(function (ids) {
            alert(ids.userId);
            window.localStorage.setItem("oneSignalId", ids.userId);
        });
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



    $("body").on("click", "#accordion li.parent", function () {
        if (false === $(this).children("ul").is(':visible')) {
            $('#accordion ul').slideUp(300);
        }
        $(this).children("ul").slideToggle(300);
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