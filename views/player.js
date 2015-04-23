/* global define */

define([
    'underscore',
    'views/view',
    'jade!templates/player',
    'lib/audio/player',
    'lib/audio/instrument-loader'
], function (_, View, template, audio, instrumentLoader) {
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

            this.song.forEachNote(function (note, unitOfTime, instrumentName) {
                note = _.clone(note);
                note.freq = Math.pow(2, 4) * note.freq;
                var start = note.tStart * unitOfTime, stop = (note.tStart + note.duration) * unitOfTime;
                instrumentLoader.get(instrumentName).playNote(ac, gain, note, start, stop);
            });

            this.$('.stop-button').attr('disabled', false);
        },
        stop: function stop () {
            this.reset();
            this.$('.stop-button').attr('disabled', true);
        }
    });
});
