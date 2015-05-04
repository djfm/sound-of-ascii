/* global define */

define([
    'underscore',
    'lib/workforce',
    'lib/instruments/tosc/presets'
], function (_, workforce, presets) {

    // syntax idea for instr def:
    // :supernova {vol 0.12 fl -2 fr 2 type exp} {vol fl 4 fr -4 mod PM} {vol 0.12 fr -2 type square} -- {addDetunedNotes [12 24]}

    function fillAudioBuffer(buffer, channelData) {
        var cCount      = channelData.length;
        var dInSamples  = buffer.length;

        for (var c = 0; c < cCount; ++c) {
            var channel = buffer.getChannelData(c);
            for (var s = 0; s < dInSamples; ++s) {
                channel[s] = channelData[c][s];
            }
        }

        return buffer;
    }

    return function Tosc (presetName) {
        var preset = (presets[presetName] || presets.erazzor);

        var buffers = {};

        this.warmUp = function toscWarmUp (ac, destination, note, sStart, sStop) {

            if (note.freq <= 0) {
                return;
            }

            var sDuration = sStop - sStart;
            var cacheKey = sDuration + "@" + note.name;

            if (!buffers[cacheKey]) {
                var dInSamples = Math.round(sDuration * ac.sampleRate);

                var builder = workforce.hire(
                    'lib/instruments/tosc/generator::makeBuffer',
                    preset, note.freq, ac.sampleRate, sDuration
                );

                buffers[cacheKey] = builder;

                return builder.then(function (subBuffer) {
                    var buffer = ac.createBuffer(2, dInSamples, ac.sampleRate);
                    fillAudioBuffer(buffer, subBuffer);
                    buffers[cacheKey] = buffer;
                });
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
            if (note.freq <= 0) {
                return;
            }

            var cacheKey = (sStop - sStart) + "@" + note.name;

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
