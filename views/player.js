/* global define */

define([
    'underscore',
    'views/view',
    'jade!templates/player',
    'lib/audio/player',
    'lib/solfege',
    'lib/audio/instrument-loader'
], function (_, View, template, audio, solfege, instrumentLoader) {
    return View.extend({
        initialize: function initializePlayerView () {
            this.template = template;
        },
        getRenderData: function () {
            return {};
        },
        events: {
            'click .play-button': 'play',
            'click .stop-button': 'stop'
        },
        reset: function resetPlayerView () {
            if (this.player) {
                // release resources
                this.player.reset();
            } else {
                this.player = new audio.Player();
            }
        },
        play: function play () {
            this.reset();

            var ac = this.player.getAudioContext();

            var gain = ac.createGain();
            gain.gain.value = 0.5;

            gain.connect(ac.destination);
            var song = this.song;
            var unitOfTime = song.unitOfTime;
            var absoluteDuration = song.absoluteDuration;

            _.each([true, false], function (warmUp) {
                song.forEachNote(unitOfTime, 0, absoluteDuration, function (sStart, sDuration, note, control) {
                    note = solfege.parseNote(note);
                    note.freq = Math.pow(2, 4) * note.freq;
                    var instrument = instrumentLoader.get(control.trackName);
                    if (warmUp && instrument.warmUp) {
                        instrument.warmUp(ac, gain, note, sStart, sStart + sDuration);
                    } else if (!warmUp) {
                        instrument.playNote(ac, gain, note, sStart, sStart + sDuration);
                    }
                });
            });

            this.$('.stop-button').attr('disabled', false);
        },
        stop: function stop () {
            this.reset();
            this.$('.stop-button').attr('disabled', true);
        }
    });
});
