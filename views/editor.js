/* global define */

define([
        'views/view',
        'jade!templates/editor',
        'jade!templates/song',
        'lib/song-generator',
        'lib/audio/player',
        'lib/song'
    ], function (View, template, songTemplate, songGenerator, playerLib, songLib) {
    return View.extend({
        initialize: function initializeEditorView () {
            this.template = template;

            // this.testStuff();

        },
        testStuff: function testStuff () {
            var player = new playerLib.Player();
            var ac = player.getAudioContext();
            var osc = ac.createOscillator();
            osc.frequency = 440;
            osc.type = 'sine';

            var stream = ac.createMediaStreamDestination();

            osc.connect(stream);
            osc.start(0);
            osc.stop(5);
            osc.onended = function () {
                console.log('done');
            };
        },
        events: {
            'keyup .source-code': function onEditorTextareaKeyup (e) {
                var text = this.$(e.target).val().trim();
                if (text !== this.text) {
                    this.text = text;
                    this.onSourceChanged(this.text);
                }
            }
        },
        onSourceChanged: function onSourceChanged (text) {
            this.songGenerator = new songGenerator.SongGenerator();
            try {
                this.songGenerator.addSource(text);
                var songPattern = this.songGenerator.buildPattern(
                    this.songGenerator.getSongPatternName()
                );
                var song = new songLib.Song(songPattern);
                this.displayCompiledSong(song);
                this.errorFeedback(null); // clear previous errors
            } catch (e) {
                this.errorFeedback(e);
                this.displayCompiledSong(null); // clear previous result
            }
        },
        errorFeedback: function errorFeedback (message) {
            if (!message) {
                this.$('.error-feedback').html('&nbsp;');
            } else {
                this.$('.error-feedback').html('<div>' + message + '</div>');
            }
        },
        displayCompiledSong: function displayCompiledSong (song) {
            console.log(song);
            if (!song) {
                this.$('.compiled-song-root').html('');
            } else {
                this.$('.compiled-song-root').html(songTemplate({
                    song: song
                }));
            }
        }
    });
});
