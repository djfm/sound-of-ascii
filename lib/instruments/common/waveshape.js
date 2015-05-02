/* global define */

define(['lib/math'], function (math) {
    return {
        sine: function sineWaveShape (phase) {
            return Math.sin(phase * 2 * Math.PI);
        },
        triangle: function triangleWaveShape (phase) {
            var phi = math.fraction(phase);
            if (phi < 0.25) {
                return phi * 4;
            } else if (phi < 0.75) {
                return 2 - phi * 4;
            } else {
                return phi * 4 - 4;
            }
        },
        saw: function sawWaveShape (phase) {
            return -1 + math.fraction(phase) * 2;
        },
        square: function squareWaveShape (phase) {
            return math.fraction(phase) > 0.5 ? -1 : 1;
        },
        moogSaw: function moogSawWaveShape (phase) {
            var phi = math.fraction(phase);
            if (phi < 0.5) {
                return -1 + phi * 4;
            } else {
                return 1 - 2 * phi;
            }
        },
        exp: function expWaveShape (phase) {
            var phi = math.fraction(phase);
            if (phi > 0.5) {
                phi = 1 - phi;
            }
            return -1 + 8 * phi * phi;
        },
        noise: function noiseWaveShape () {
            return 1 - 2 * Math.random();
        }
    };
});
