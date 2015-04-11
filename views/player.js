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
            'click .play-button': 'play'
        },
        play: function play () {

            var player = new audio.Player();

            var ac = player.getAudioContext();

            var instrument = new Oscii();

            this.song.forEachNote(function (note, unitOfTime) {
                note = _.clone(note);
                note.freq = Math.pow(2, 4) * note.freq;
                var start = note.tStart * unitOfTime, stop = (note.tStart + note.duration) * unitOfTime;
                instrument.playNote(ac, ac.destination, note, start, stop);
            });
        }
    });
});
