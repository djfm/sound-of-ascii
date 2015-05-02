/* global define */
define([
    'underscore',
    'lib/instruments/common/waveshape',
    'lib/instruments/common/oscillator'
], function (_, WaveShape, oscillator) {

    function makeOscillators (preset, freq, sampleRate) {

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

            lOsc = new oscillator.Oscillator(
                waveShape,
                getAdjustedFreq(oscData.crs, oscData.fl),
                vol,
                lPhaseOffset,
                lOsc,
                modAlgo
            );
            rOsc = new oscillator.Oscillator(
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

    function makeBuffer (preset, freq, sampleRate, sDuration) {
        var addDetunedNotes = [0].concat(preset.addDetunedNotes || []);

        var freqs = _.map(addDetunedNotes, function (semitones) {
            return Math.pow(2, - (semitones * 100 / 1200)) * freq;
        });

        var dInSamples = Math.round(sDuration * sampleRate);

        function allocChannel () {
            return new Float32Array(dInSamples);
        }

        var buffer = [allocChannel(), allocChannel()];

        var mixFactor = freqs.length;

        _.each(freqs, function prepareNoteForFrequency (freq) {
            var oscs = makeOscillators(preset, freq, sampleRate);
            for (var channel = 0; channel < 2; ++channel) {
                for (var s = 0; s < dInSamples; ++s) {
                    buffer[channel][s] += oscs[channel].getSample() / mixFactor;
                }
            }
        });

        return buffer;
    }

    return {
        makeBuffer: makeBuffer
    };
});
