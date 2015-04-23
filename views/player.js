/* global define */

define(['underscore', 'views/view', 'jade!templates/player', 'lib/audio/player', 'lib/instruments/oscii'], function (_, View, template, audio, Oscii) {
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

            var instrument = new Oscii();

            this.song.forEachNote(function (note, unitOfTime, instrumentName) {
                note = _.clone(note);
                note.freq = Math.pow(2, 4) * note.freq;
                var start = note.tStart * unitOfTime, stop = (note.tStart + note.duration) * unitOfTime;
                instrument.playNote(ac, gain, note, start, stop);
            });

            this.$('.stop-button').attr('disabled', false);
        },
        stop: function stop () {
            this.reset();
            this.$('.stop-button').attr('disabled', true);
        }
    });
});
