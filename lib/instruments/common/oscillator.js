/* global define */

define(['lib/math'], function (math) {
    return {
        Oscillator: function Oscillator (waveShape, dPhase, vol, phaseOffset, subOsc, modAlgo) {
            var phase = +phaseOffset || 0;

            vol = +vol || 1;

            function recalcPhase () {
                phase = math.absFraction(phase) + 2;
            }

            this.getSample = function getSample () {
                recalcPhase();

                var sample = waveShape(phase) * vol;

                if (subOsc && modAlgo !== 'None') {
                    if (modAlgo === 'AM') {
                        sample *= subOsc.getSample();
                    } else if (modAlgo === 'PM') {
                        sample = waveShape(phase + subOsc.getSample()) * vol;
                    } else if (modAlgo === 'Mix') {
                        sample += subOsc.getSample();
                    }
                }

                phase += dPhase;
                return sample;
            };
        }
    };
});
