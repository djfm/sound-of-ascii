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
        afterRender : function () {
            this.setupCodeMirror();
        },
        onSourceChanged: function onSourceChanged (text) {
            this.dirty = true;
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
                this.$('.error-feedback').html('<span class="label label-danger">' + message + '</span>');
            }
        },
        onSongCompiled: function onSongCompiled (song) {

            if (this.playerView) {
                this.playerView.reset();
            } else {
                this.playerView = new PlayerView({
                    el: $('.player-root'),
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
        setupCodeMirror: function setupCodeMirror () {
            if (this.codemirror) {
                return;
            }

            this.codemirror = codemirror.fromTextArea(this.$('.source-code').get(0), {
                lineNumbers: true,
                mode: 'aascii'
            });

            var that = this;

            this.codemirror.on('change', function () {
                that.onSourceChanged(that.codemirror.getValue());
            });
        },
        loadSong: function loadSong (song) {
            this.codemirror.setValue(song.source);
            this.$('.song-title').html(song.title || '(unnamed song)');
        },
        load: function load (songId) {
            this.setupCodeMirror();

            songId = songId || 'examples/save-tonight-multiple-tracks.aascii';

            if (!this.dirty) {
                var that = this;
                $.get(songId).then(function (data) {
                    that.loadSong({
                        title: songId,
                        source: data
                    });
                });
            }
        },
        afterMount: function () {
            if (this.playerView) {
                this.playerView.delegateEvents();
            }
        }

    });
});
