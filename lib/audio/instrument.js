/* global define */
define([], function () {

    function Instrument () {

        /**
         * This is an `interface` method that does nothing but provide documentation
         * on how to implement instruments.
         *
         * The method should return an AudioNode or look-alike, that
         * has a connect method and a start method.
         */
        this.playNote = function playNote (audioContext, note) {
            /* jshint unused:false */
        };
    }

    return {
        Instrument: Instrument
    };

});
