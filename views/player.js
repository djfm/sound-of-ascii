/* global define */

define(['views/view', 'jade!templates/player', 'lib/audio/player'], function (View, template, audio) {
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

            this.song.forEachNote(function (note, unitOfTime) {

                var start = note.tStart * unitOfTime, stop = (note.tStart + note.duration) * unitOfTime;

                var osc = ac.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = Math.pow(2, 4) * note.freq;
                osc.connect(ac.destination);
                osc.start(start);
                osc.stop(stop);
            });
        }
    });
});
