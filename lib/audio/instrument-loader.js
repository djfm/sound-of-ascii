/* global define */
define([
    'lib/instruments/tosc'
], function (Tosc) {

    var cache = {};

    return {
        get: function get (presetName) {
            if (!cache[presetName]) {
                cache[presetName] = new Tosc(presetName);
            }

            return cache[presetName];
        }
    };
});
