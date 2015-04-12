/* global define */
define([], function () {

    function makeContext () {
        try {
            // Fix up for prefixing
            window.AudioContext = window.AudioContext||window.webkitAudioContext;
            return new window.AudioContext();
        }
        catch (e) {
            alert('Web Audio API is not supported in this browser');
            throw e;
        }
    }

    function Player () {
        var context = makeContext();

        this.getAudioContext = function getAudioContext () {
            return context;
        };

        this.reset = function () {
            context.close();
            context = makeContext();
        };
    }

    return {
        Player: Player
    };
});
