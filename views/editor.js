/* global define */

define([
        'jquery',
        'views/view',
        'jade!templates/editor',
        'jade!templates/song',
        'lib/song-generator',
        'lib/audio/player',
        'views/player',
        'lib/song'
    ], function ($, View, template, songTemplate, songGenerator, playerLib, PlayerView, songLib) {
    return View.extend({
        initialize: function initializeEditorView () {
            this.template = template;
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
                this.$('.compiled-song-root').html(songTemplate({
                    song: song
                }));
            }
        },
        afterRender: function loadDefaultSong () {
            var that = this;
            $.get('examples/save-tonight-multiple-tracks.aascii').then(function (data) {
                $('textarea.source-code').val(data);
                that.onSourceChanged(data);
            });
        }
    });
});
