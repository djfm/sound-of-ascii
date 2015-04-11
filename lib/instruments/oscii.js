/* global define */

define([], function () {

    return function Oscii () {
        this.playNote = function osciiPlayNote (ac, destination, note, sStart, sStop) {
            var sine = ac.createOscillator();
            sine.frequency.value = note.freq;

            var gain = ac.createGain();
            gain.gain.value = 0.2;

            sine.connect(gain);
            gain.connect(destination);
            
            sine.start(sStart);
            sine.stop(sStop);
        };
    };

});
