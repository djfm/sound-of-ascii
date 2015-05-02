/* global define */

define([
        'jquery',
        'cm/lib/codemirror',
        'src/aascii-codemirror-mode',
        'views/view',
        'jade!templates/editor',
        'views/song',
        'lib/song-generator',
        'lib/audio/player',
        'views/player',
        'lib/song'
    ], function ($, codemirror, mode, View, template, SongView, songGenerator, playerLib, PlayerView) {
    return View.extend({
        initialize: function initializeEditorView () {
            this.template = template;
        },
        events: {
        },
        onSourceChanged: function onSourceChanged (text) {
            this.songGenerator = new songGenerator.SongGenerator();
            try {
                this.songGenerator.addSource(text);
                var song = this.songGenerator.buildSong();
                this.onSongCompiled(song);
                this.errorFeedback(null); // clear previous errors
            } catch (e) {
                this.errorFeedback(e);
                this.onSongCompiled(null); // clear previous result
            }
        },
        errorFeedback: function errorFeedback (message) {
            if (!message) {
                this.$('.error-feedback').html('&nbsp;');
            } else {
                this.$('.error-feedback').html('<div>' + message + '</div>');
            }
        },
        onSongCompiled: function onSongCompiled (song) {

            if (this.playerView) {
                this.playerView.reset();
            } else {
                this.playerView = new PlayerView({
                    el: this.$('.player-root'),
                });
            }

            if (!song) {
                this.$('.compiled-song-root').html('');
                this.$('.player-root').html('');
            } else {
                this.playerView.song = song;
                this.playerView.render();
                var songView = new SongView({
                    el: this.$('.compiled-song-root')
                });
                songView.song = song;
                songView.render();
            }
        },
        afterRender: function loadDefaultSong () {
            this.codemirror = codemirror.fromTextArea(this.$('.source-code').get(0), {
                lineNumbers: true,
                mode: 'aascii'
            });

            var that = this;

            this.codemirror.on('change', function () {
                that.onSourceChanged(that.codemirror.getValue());
            });

            $.get('examples/save-tonight-multiple-tracks.aascii').then(function (data) {
                that.codemirror.setValue(data);
            });
        }
    });
});
