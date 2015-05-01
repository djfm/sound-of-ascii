/* global define */

define(['underscore', 'lib/instruments/tosc-presets',], function (_, presets) {

    function fraction (x) {
        return x - Math.floor(x);
    }

    function absFraction (x) {
        return (x - ( x >= 0 ? Math.floor(x) : Math.floor(x) - 1 ));
    }

    var WaveShape = {
        sine: function sineWaveShape (phase) {
            return Math.sin(phase * 2 * Math.PI);
        },
        triangle: function triangleWaveShape (phase) {
            var phi = fraction(phase);
            if (phi < 0.25) {
                return phi * 4;
            } else if (phi < 0.75) {
                return 2 - phi * 4;
            } else {
                return phi * 4 - 4;
            }
        },
        saw: function sawWaveShape (phase) {
            return -1 + fraction(phase) * 2;
        },
        square: function squareWaveShape (phase) {
            return fraction(phase) > 0.5 ? -1 : 1;
        },
        moogSaw: function moogSawWaveShape (phase) {
            var phi = fraction(phase);
            if (phi < 0.5) {
                return -1 + phi * 4;
            } else {
                return 1 - 2 * phi;
            }
        },
        exp: function expWaveShape (phase) {
            var phi = fraction(phase);
            if (phi > 0.5) {
                phi = 1 - phi;
            }
            return -1 + 8 * phi * phi;
        },
        noise: function noiseWaveShape () {
            return 1 - 2 * Math.random();
        }
    };

    function Oscillator (waveShape, dPhase, vol, phaseOffset, subOsc, modAlgo) {
        var phase = +phaseOffset || 0;

        vol = +vol || 1;

        function recalcPhase () {
            phase = absFraction(phase) + 2;
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

    return function Tosc (presetName) {
        var preset = (presets[presetName] || presets.erazzor);

        var buffers = {};

        function makeOscillators (freq, sampleRate) {

            function getAdjustedFreq (coarseDetuning, fineDetuning) {

                coarseDetuning = +coarseDetuning || 0;
                fineDetuning   = +fineDetuning || 0;

                return freq * Math.pow(2, - (100 * coarseDetuning + fineDetuning) / 1200) / sampleRate;
            }

            var lOsc, rOsc;

            _.each(preset.oscs, function (oscData) {

                var waveShape = WaveShape[oscData.type];

                if (!waveShape) {
                    throw new Error('Invalid waveshape: ' + oscData.type + '.');
                }

                var vol = +oscData.vol || 1 / preset.length;

                var lPhaseOffset = ((+oscData.po || 0) + (+oscData.spd || 0)) / 360;
                var rPhaseOffset = (+oscData.po || 0) / 360;

                var modAlgo = oscData.mod || 'None';
                if (['AM', 'PM', 'FM', 'Mix', 'Sync', 'None'].indexOf(modAlgo) === -1) {
                    throw new Error('Invald modulation algorithm: ' + modAlgo + '.');
                }

                lOsc = new Oscillator(
                    waveShape,
                    getAdjustedFreq(oscData.crs, oscData.fl),
                    vol,
                    lPhaseOffset,
                    lOsc,
                    modAlgo
                );
                rOsc = new Oscillator(
                    waveShape,
                    getAdjustedFreq(oscData.crs, oscData.fl),
                    vol,
                    rPhaseOffset,
                    rOsc,
                    modAlgo
                );
            });

            return [lOsc, rOsc];
        }

        this.warmUp = function toscWarmUp (ac, destination, note, sStart, sStop) {
            var freq = note.freq / ac.sampleRate;
            var dInSamples = Math.round((sStop - sStart) * ac.sampleRate);
            var cacheKey = freq + ' - ' + dInSamples;

            if (!buffers[cacheKey]) {
                var oscs = makeOscillators(note.freq, ac.sampleRate);

                var buffer = ac.createBuffer(2, dInSamples, ac.sampleRate);

                for (var s = 0; s < dInSamples; ++s) {
                    for (var channel = 0; channel < 2; ++channel) {
                        buffer.getChannelData(channel)[s] = oscs[channel].getSample();
                    }
                }

                buffers[cacheKey] = buffer;
            }
        };

        function makeEnvelopeNode (ac, sStart, sStop) {
            var env = ac.createGain();
            var vMax = 0.1;
            var a = 0.1;
            var r = 0.1;
            var duration = sStop - sStart;
            env.gain.setValueAtTime(0, sStart);
            env.gain.linearRampToValueAtTime(vMax, sStart + a * duration);
            env.gain.linearRampToValueAtTime(0, sStop - r * duration);
            return env;
        }

        this.playNote = function toscPlayNote (ac, destination, note, sStart, sStop) {
            var freq = note.freq / ac.sampleRate;
            var dInSamples = Math.round((sStop - sStart) * ac.sampleRate);
            var cacheKey = freq + ' - ' + dInSamples;

            var bufferSource = ac.createBufferSource();
            bufferSource.buffer = buffers[cacheKey];

            var envelope = makeEnvelopeNode(ac, sStart, sStop);

            bufferSource.connect(envelope);
            envelope.connect(destination);
            bufferSource.start(sStart);
            bufferSource.stop(sStop);
        };
    };

});
