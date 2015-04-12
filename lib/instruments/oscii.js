/* global define */

define([], function () {

    return function Oscii () {
        this.playNote = function osciiPlayNote (ac, destination, note, sStart, sStop) {
            var duration = sStop - sStart;
            var sine = ac.createOscillator();
            sine.frequency.value = note.freq;

            var env = ac.createGain();

            var vMax = 0.1;

            var a = 0.1;
            var r = 0.1;
            env.gain.setValueAtTime(0, sStart);
            env.gain.linearRampToValueAtTime(vMax, sStart + a * duration);
            env.gain.linearRampToValueAtTime(0, sStop - r * duration);

            sine.connect(env);
            env.connect(destination);

            sine.start(sStart);
            sine.stop(sStop);
        };
    };

});
