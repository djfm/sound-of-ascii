/* global define */

define([], function () {

    return function Oscii (presetName) {
        this.playNote = function osciiPlayNote (ac, destination, note, sStart, sStop) {
            var duration = sStop - sStart;
            var osc = ac.createOscillator();
            osc.frequency.value = note.freq;
            osc.type = presetName === 'square' ? 'square' : 'sine';

            var env = ac.createGain();

            var vMax = 0.1;

            var a = 0.1;
            var r = 0.1;
            env.gain.setValueAtTime(0, sStart);
            env.gain.linearRampToValueAtTime(vMax, sStart + a * duration);
            env.gain.linearRampToValueAtTime(0, sStop - r * duration);

            osc.connect(env);
            env.connect(destination);

            osc.start(sStart);
            osc.stop(sStop);
        };
    };

});
