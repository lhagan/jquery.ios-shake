(function($) {
    jQuery.shake = function(options) {
        // Merge passed options with defaults
        var opts = jQuery.extend({},
        jQuery.shake.defaults, options);

        // insert debug content
        if (opts.debug !== "") {
            var debug = $(opts.debug);
            debug.append('x: <span id="x">0</span><br>');
            debug.append('y: <span id="y">0</span><br>');
            debug.append('z: <span id="z">0</span><br><br>');

            debug.append('shake: <span id="shake">0</span><br>');
            debug.append('shakeaccum: <span id="shakeaccum"></span><br>');
            debug.append('debug: <span id="console"></span><br>');
        }

        // initialize acceleration variables
        var ax = 0;
        var ay = 0;
        var az = 0;
        var axa = 0;
        var aya = 0;
        var aza = 0;

        // initialize misc internal variables
        var shakecount = 0;
        var shakeaccum = 0;
        var curtime = new Date();
        var prevtime = new Date();
        var timeout = false;

        // http://www.mobilexweb.com/samples/ball.html
        // detect whether acceleration is supported
        if (window.DeviceMotionEvent === undefined) {
            if (opts.supported !== "") {
                $(opts.supported).html("Your browser does not support Device Orientation and Motion API. Try it on an iPhone, iPod or iPad with iOS 4.2+.");
            }
        } else {
            window.ondevicemotion = function(event) {
                // get acceleration values
                var acc = event.accelerationIncludingGravity;
                ax = acc.x;
                ay = acc.y;
                az = acc.y;

                // high pass-filter to remove gravity
                // TODO detect and use gyro (no gravity) on supported devices
                // http://iphonedevelopertips.com/user-interface/accelerometer-101.html
                axa = ax - ((ax * opts.hf) + (axa * (1.0 - opts.hf)));
                aya = ay - ((ay * opts.hf) + (aya * (1.0 - opts.hf)));
                aza = az - ((az * opts.hf) + (aza * (1.0 - opts.hf)));

                // detect single shake
                // http://discussions.apple.com/thread.jspa?messageID=8224655
                var beenhere = false;
                var shake = false;
                if (beenhere) {
                    return;
                }
                beenhere = true;
                if (Math.abs(ax - 2 * axa) > opts.violence * 1.5 || Math.abs(ay - 2 * aya) > opts.violence * 2 || Math.abs(az - 2 * aza) > opts.violence * 3 && timeout === false) {
                    shakeaccum += 1;
                }

                // detect shake event (several shakes)
                curtime = new Date();
                var timedelta = curtime.getTime() - prevtime.getTime();
                $('#console').html(timedelta);

                if (timeout) {
                    if (timedelta >= opts.debounce) {
                        timeout = false;
                    } else {
                        timeout = true;
                    }
                    shakeaccum = 0;
                }

                if (shakeaccum >= opts.shakethreshold && timeout === false) {
                    shakecount += 1;
                    $("#shake").html(shakecount);
                    prevtime = curtime;
                    timeout = true;
                    opts.callback.call();
                }
                beenhere = true;
            };
        }
        if (opts.debug !== "") {
            setInterval(function() {
                // output debug data
                $('#x').html(Math.abs(ax - 2 * axa).toFixed(1));
                $('#y').html(Math.abs(ay - 2 * aya).toFixed(1));
                $('#z').html(Math.abs(az - 2 * aza).toFixed(1));
                $('#shakeaccum').html(shakeaccum);
            },
            10);
        }
    };
})(jQuery);

// plugin default options
jQuery.shake.defaults = {
    // debug div id
    debug: "",

    // single shake sensitivity
    violence: 3.0,

    // high-pass filter constant
    hf: 0.2,

    // number of single shakes required to fire a shake event
    shakethreshold: 5,

    // delay between shake events (in ms)
    debounce: 1000,

    // anonymous callback function
    callback: function() {}
};

