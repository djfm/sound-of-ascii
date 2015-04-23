/* global define */
define(['lib/instruments/oscii'], function (Oscii) {

    var cache = {};

    return {
        get: function get (presetName) {
            if (!cache[presetName]) {
                cache[presetName] = new Oscii(presetName);
            }

            return cache[presetName];
        }
    };
});
