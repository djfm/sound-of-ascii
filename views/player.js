/* global define */

define([
    'underscore',
    'q',
    'views/view',
    'jade!templates/player',
    'lib/audio/player',
    'lib/solfege',
    'lib/audio/instrument-loader'
], function (_, q, View, template, audio, solfege, instrumentLoader) {
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
                if (this.gain) {
                    this.gain.disconnect();
                }
                // release resources
                this.player.reset();
            } else {
                this.player = new audio.Player();
            }
        },
        play: function play () {
            this.reset();

            var ac = this.player.getAudioContext();

            var gain = this.gain = ac.createGain();
            gain.gain.value = 0.5;

            gain.connect(ac.destination);

            var withEachNote = (function withEachNote (callback) {

                var delay = 0;

                this.song.forEachNote(this.song.unitOfTime, 0, this.song.absoluteDuration, function (sStart, sDuration, noteStr, control) {
                    var instrument = instrumentLoader.get(control.trackName);
                    var note = solfege.parseNote(noteStr);
                    if (note.freq > 0) {
                        note.freq *= 16; // adjust freq by 4 octaves
                        callback(sStart + delay, sStart + sDuration + delay, note, control, instrument);
                    }
                });
            }).bind(this);

            var promises = [];

            this.$('.loading').show();

            withEachNote(function warmUp (sStart, sStop, note, control, instrument) {
                if (instrument.warmUp) {
                    promises.push(instrument.warmUp(ac, gain, note, sStart, sStop));
                }
            });

            var that = this;

            q.all(promises).then(function () {
                that.$('.loading').hide();
                withEachNote(function playNotes (sStart, sStop, note, control, instrument) {
                    instrument.playNote(ac, gain, note, sStart, sStop);
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
