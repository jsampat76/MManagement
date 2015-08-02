var pushNotification;

document.addEventListener("deviceready", function () {
    pushNotification = window.plugins.pushNotification;
    pushNotification.register(
            tokenHandler,
            errorHandler,
            {
                "badge": "true",
                "sound": "true",
                "alert": "true",
                "ecb": "onNotificationAPN"
            });

    pushNotification.setApplicationIconBadgeNumber(successCallback, errorCallback, badgeCount);



});

function onNotificationAPN(event) {
    if (event.alert)
    {
        navigator.notification.alert(event.alert);
    }

    if (event.sound)
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if (event.badge)
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}

function tokenHandler(result) {
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
    alert('device token = ' + result);


}

function progress(e) {
    if (e.lengthComputable) {
        //this makes a nice fancy progress bar
        $('progress').attr({value: e.loaded, max: e.total});
    }
}




$(document).ready(function () {

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